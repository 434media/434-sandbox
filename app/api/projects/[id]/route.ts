import { FieldValue } from "firebase-admin/firestore";
import { adminDb, firestoreConfigured } from "@/lib/firebase/admin";
import { mockStore } from "@/lib/cms/mock-store";
import { logAppEvent, withApiLogging } from "@/lib/splunk/api-logging";

export const runtime = "nodejs";

export const PATCH = withApiLogging("/api/projects/[id]", async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim().slice(0, 200);
    if (Array.isArray(body.slideData)) update.slideData = body.slideData;
    if (typeof body.status === "string" && ["draft", "ready", "exported"].includes(body.status)) update.status = body.status;
    if (!firestoreConfigured()) {
      const store = mockStore();
      const index = store.projects.findIndex((project) => project.id === id);
      if (index < 0) throw new Error("Project not found.");
      const { updatedAt: _updatedAt, ...values } = update;
      store.projects[index] = { ...store.projects[index], ...values, updatedAt: new Date().toISOString() };
      return Response.json({ ok: true, mode: "demo" });
    }
    await adminDb().collection("cmsProjects").doc(id).update(update);
    return Response.json({ ok: true });
  } catch (error) {
    logAppEvent("api_error", { route: "/api/projects/[id]", operation: "update_project", error_message: error instanceof Error ? error.message : "Unable to update project." });
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update project." }, { status: 400 });
  }
});

export const DELETE = withApiLogging("/api/projects/[id]", async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!firestoreConfigured()) {
      const store = mockStore();
      store.projects = store.projects.filter((project) => project.id !== id);
      return Response.json({ ok: true, mode: "demo" });
    }
    await adminDb().collection("cmsProjects").doc(id).delete();
    return Response.json({ ok: true });
  } catch (error) {
    logAppEvent("api_error", { route: "/api/projects/[id]", operation: "delete_project", error_message: error instanceof Error ? error.message : "Unable to delete project." });
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete project." }, { status: 500 });
  }
});
