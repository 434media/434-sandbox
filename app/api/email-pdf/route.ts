import { generateDeckPdf, safePdfFilename } from "@/lib/deck-export/pdf";
import type { EmailDeckRequest } from "@/lib/deck-export/types";
import { sendDeckEmail } from "@/lib/email/send-deck-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as EmailDeckRequest;
    if (!payload.clientName?.trim() || !/^\S+@\S+\.\S+$/.test(payload.clientEmail || "")) {
      return Response.json({ error: "A valid client name and email are required." }, { status: 400 });
    }
    if (!payload.projectName?.trim() || !Array.isArray(payload.slideData) || payload.slideData.length !== 12) {
      return Response.json({ error: "The project is missing deck data." }, { status: 400 });
    }
    const pdf = await generateDeckPdf(payload, new URL(request.url).origin);
    const providerId = await sendDeckEmail({ ...payload, filename: safePdfFilename(payload.projectName), pdf });
    console.info("[Deck email sent]", { projectId: payload.projectId, recipient: payload.clientEmail, providerId });
    return Response.json({ ok: true, providerId });
  } catch (error) {
    console.error("[Deck email]", error);
    return Response.json({ error: error instanceof Error ? error.message : "Email delivery failed." }, { status: 500 });
  }
}
