import { adminDb, firestoreConfigured } from "@/lib/firebase/admin";
import { mockStore } from "@/lib/cms/mock-store";
import type { AnalyticsMetrics, IntakeSubmission } from "@/lib/cms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!firestoreConfigured()) {
      const { intakes, projects } = mockStore();
      const metrics: AnalyticsMetrics = { totalSubmissions: intakes.length, newLeads: intakes.filter((lead) => lead.status === "new").length, readyToGenerate: intakes.filter((lead) => lead.deckStatus === "ready_to_generate").length, generatedDecks: projects.filter((project) => project.sourceMode === "intake").length, averageLeadScore: intakes.length ? Math.round(intakes.reduce((sum, lead) => sum + lead.leadScore, 0) / intakes.length) : 0 };
      return Response.json({ metrics, mode: "demo" });
    }
    const [intakes, projects] = await Promise.all([
      adminDb().collection("intakeSubmissions").get(),
      adminDb().collection("cmsProjects").get(),
    ]);
    const leads = intakes.docs.map((doc) => doc.data() as IntakeSubmission);
    const metrics: AnalyticsMetrics = {
      totalSubmissions: leads.length,
      newLeads: leads.filter((lead) => lead.status === "new").length,
      readyToGenerate: leads.filter((lead) => lead.deckStatus === "ready_to_generate").length,
      generatedDecks: projects.docs.filter((doc) => doc.data().sourceMode === "intake").length,
      averageLeadScore: leads.length ? Math.round(leads.reduce((sum, lead) => sum + (lead.leadScore ?? 0), 0) / leads.length) : 0,
    };
    return Response.json({ metrics });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load analytics." }, { status: 500 });
  }
}
