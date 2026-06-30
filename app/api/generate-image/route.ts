import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Add GOOGLE_AI_API_KEY to .env.local to enable AI image generation. Get a free key at aistudio.google.com." },
      { status: 500 }
    );
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: prompt.trim() }],
        parameters: { sampleCount: 1 },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message ?? "Image generation failed";
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  const mime = data?.predictions?.[0]?.mimeType ?? "image/png";

  if (!b64) {
    return NextResponse.json({ error: "No image returned from API" }, { status: 500 });
  }

  return NextResponse.json({ imageUrl: `data:${mime};base64,${b64}` });
}
