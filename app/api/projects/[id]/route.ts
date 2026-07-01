import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim().slice(0, 200);
    if (Array.isArray(body.slideData)) update.slideData = body.slideData;
    if (typeof body.status === "string" && ["draft", "ready", "exported"].includes(body.status)) update.status = body.status;
    await adminDb().collection("cmsProjects").doc(id).update(update);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update project." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await adminDb().collection("cmsProjects").doc(id).delete();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete project." }, { status: 500 });
  }
}

