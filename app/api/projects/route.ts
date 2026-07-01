import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { CMSProject } from "@/lib/cms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serialize(id: string, data: FirebaseFirestore.DocumentData): CMSProject {
  const iso = (value: unknown) => value && typeof value === "object" && "toDate" in value
    ? (value as FirebaseFirestore.Timestamp).toDate().toISOString()
    : String(value ?? new Date().toISOString());
  return { id, ...data, createdAt: iso(data.createdAt), updatedAt: iso(data.updatedAt) } as CMSProject;
}

export async function GET() {
  try {
    const snapshot = await adminDb().collection("cmsProjects").orderBy("updatedAt", "desc").limit(250).get();
    return Response.json({ projects: snapshot.docs.map((doc) => serialize(doc.id, doc.data())) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load projects." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<CMSProject>;
    if (!body.name?.trim() || !Array.isArray(body.slideData) || !["intake", "manual"].includes(body.sourceMode ?? "")) throw new Error("Invalid project data.");
    const record = { name: body.name.trim().slice(0, 200), status: body.status ?? "draft", sourceMode: body.sourceMode, intakeId: body.intakeId ?? null, slideData: body.slideData, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
    const ref = await adminDb().collection("cmsProjects").add(record);
    const saved = await ref.get();
    return Response.json({ project: serialize(saved.id, saved.data()!) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save project." }, { status: 400 });
  }
}

