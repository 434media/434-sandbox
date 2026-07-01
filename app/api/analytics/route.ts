import { adminDb } from "@/lib/firebase/admin";
import type { AnalyticsMetrics, IntakeSubmission } from "@/lib/cms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
