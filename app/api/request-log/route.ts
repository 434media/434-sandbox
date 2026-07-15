import { sendSplunkEvent } from "@/lib/splunk/hec";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (request.headers.get("x-internal-request-log") !== "1") {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const event = await request.json();
    if (event && typeof event === "object") {
      sendSplunkEvent(event as Record<string, unknown>);
    }
  } catch {
    return new Response(null, { status: 204 });
  }

  return new Response(null, { status: 204 });
}

