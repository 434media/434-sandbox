import { FieldValue } from "firebase-admin/firestore";
import { adminDb, firestoreConfigured } from "@/lib/firebase/admin";
import { mockId, mockStore } from "@/lib/cms/mock-store";
import { parseIntakeData, scoreIntake } from "@/lib/cms/validation";
import type { DeckStatus, IntakeSubmission, LeadStatus } from "@/lib/cms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const collection = "intakeSubmissions";

function serialize(id: string, data: FirebaseFirestore.DocumentData): IntakeSubmission {
  const iso = (value: unknown) => value && typeof value === "object" && "toDate" in value
    ? (value as FirebaseFirestore.Timestamp).toDate().toISOString()
    : String(value ?? new Date().toISOString());
  return { id, ...data, createdAt: iso(data.createdAt), updatedAt: iso(data.updatedAt) } as IntakeSubmission;
}

export async function GET() {
  try {
    if (!firestoreConfigured()) return Response.json({ intakes: mockStore().intakes, mode: "demo" });
    const snapshot = await adminDb().collection(collection).orderBy("createdAt", "desc").limit(250).get();
    return Response.json({ intakes: snapshot.docs.map((doc) => serialize(doc.id, doc.data())) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load intake submissions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = parseIntakeData(await request.json());
    const source = request.headers.get("x-intake-source") === "cms" ? "cms" : "intake-form";
    if (!firestoreConfigured()) {
      const timestamp = new Date().toISOString();
      const intake: IntakeSubmission = { id: mockId("intake"), ...data, status: "new", source, leadScore: scoreIntake(data), deckStatus: "not_started", createdAt: timestamp, updatedAt: timestamp };
      mockStore().intakes.unshift(intake);
      return Response.json({ intake, mode: "demo" }, { status: 201 });
    }
    const record = { ...data, status: "new" as LeadStatus, source, leadScore: scoreIntake(data), deckStatus: "not_started" as DeckStatus, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
    const ref = await adminDb().collection(collection).add(record);
    const saved = await ref.get();
    return Response.json({ intake: serialize(saved.id, saved.data()!) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save intake submission." }, { status: 400 });
  }
}
