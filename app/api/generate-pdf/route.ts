import { generateDeckPdf, safePdfFilename } from "@/lib/deck-export/pdf";
import type { DeckExportPayload } from "@/lib/deck-export/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as DeckExportPayload;
    if (!payload.projectName?.trim() || !Array.isArray(payload.slideData) || payload.slideData.length !== 12) {
      return Response.json({ error: "A project name and all 12 slides are required." }, { status: 400 });
    }
    const pdf = await generateDeckPdf(payload);
    const filename = safePdfFilename(payload.projectName);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[PDF export]", error);
    return Response.json({ error: error instanceof Error ? error.message : "PDF generation failed." }, { status: 500 });
  }
}
