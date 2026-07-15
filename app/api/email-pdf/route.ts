import { generateDeckPdf, safePdfFilename } from "@/lib/deck-export/pdf";
import type { EmailDeckRequest } from "@/lib/deck-export/types";
import { sendDeckEmail } from "@/lib/email/send-deck-email";
import { logAppEvent, withApiLogging } from "@/lib/splunk/api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging("/api/email-pdf", async function POST(request: Request) {
  try {
    const payload = await request.json() as EmailDeckRequest;
    // Non-ambiguous email check (each segment excludes its own delimiters) plus a
    // length cap — avoids the polynomial backtracking of an \S+@\S+\.\S+ pattern.
    const email = (payload.clientEmail ?? "").trim();
    const emailValid = email.length <= 254 && /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email);
    if (!payload.clientName?.trim() || !emailValid) {
      return Response.json({ error: "A valid client name and email are required." }, { status: 400 });
    }
    if (!payload.projectName?.trim() || !Array.isArray(payload.slideData) || payload.slideData.length !== 12) {
      return Response.json({ error: "The project is missing deck data." }, { status: 400 });
    }
    const pdf = await generateDeckPdf(payload);
    const providerId = await sendDeckEmail({ ...payload, filename: safePdfFilename(payload.projectName), pdf });
    console.info("[Deck email sent]", { projectId: payload.projectId, recipient: payload.clientEmail, providerId });
    logAppEvent("pdf_generation", { route: "/api/email-pdf", project_id: payload.projectId, delivery: "email", slide_count: payload.slideData.length });
    return Response.json({ ok: true, providerId });
  } catch (error) {
    console.error("[Deck email]", error);
    logAppEvent("server_error", { route: "/api/email-pdf", operation: "email_pdf", error_message: error instanceof Error ? error.message : "Email delivery failed." });
    return Response.json({ error: error instanceof Error ? error.message : "Email delivery failed." }, { status: 500 });
  }
});
