import { FieldValue } from "firebase-admin/firestore";
import { adminDb, firestoreConfigured } from "@/lib/firebase/admin";
import { mockStore } from "@/lib/cms/mock-store";
import { parseIntakeData, scoreIntake } from "@/lib/cms/validation";
import type { DeckStatus, LeadStatus } from "@/lib/cms/types";

export const runtime = "nodejs";
const leadStatuses: LeadStatus[] = ["new", "qualified", "ready", "archived"];
const deckStatuses: DeckStatus[] = ["not_started", "ready_to_generate", "generated"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (body.data) {
      const data = parseIntakeData(body.data);
      Object.assign(update, data, { leadScore: scoreIntake(data) });
    }
    if (typeof body.status === "string" && leadStatuses.includes(body.status as LeadStatus)) update.status = body.status;
    if (typeof body.deckStatus === "string" && deckStatuses.includes(body.deckStatus as DeckStatus)) update.deckStatus = body.deckStatus;
    if (!firestoreConfigured()) {
      const store = mockStore();
      const index = store.intakes.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Intake not found.");
      const { updatedAt: _updatedAt, ...values } = update;
      store.intakes[index] = { ...store.intakes[index], ...values, updatedAt: new Date().toISOString() };
      return Response.json({ ok: true, mode: "demo" });
    }
    await adminDb().collection("intakeSubmissions").doc(id).update(update);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update intake." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!firestoreConfigured()) {
      const store = mockStore();
      store.intakes = store.intakes.filter((item) => item.id !== id);
      return Response.json({ ok: true, mode: "demo" });
    }
    await adminDb().collection("intakeSubmissions").doc(id).delete();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete intake." }, { status: 500 });
  }
}
