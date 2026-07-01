import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Add GOOGLE_AI_API_KEY to .env.local to enable AI image generation." },
      { status: 500 }
    );
  }

  // Primary: Imagen 4 Fast (predict endpoint)
  const imagenRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: prompt.trim() }],
        parameters: { sampleCount: 1 },
      }),
    }
  );

  if (imagenRes.ok) {
    const data = await imagenRes.json();
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    const mime = data?.predictions?.[0]?.mimeType ?? "image/png";
    if (b64) {
      return NextResponse.json({ imageUrl: `data:${mime};base64,${b64}` });
    }
  }

  // Fallback: Gemini 2.5 Flash Image (generateContent endpoint)
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt.trim() }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    }
  );

  if (geminiRes.ok) {
    const data = await geminiRes.json();
    const parts: Array<{ inlineData?: { data: string; mimeType: string } }> =
      data?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p) => p.inlineData?.data);
    if (imgPart?.inlineData) {
      const { data: b64, mimeType } = imgPart.inlineData;
      return NextResponse.json({ imageUrl: `data:${mimeType};base64,${b64}` });
    }
  }

  // Surface the actual error
  let errorMsg = "Image generation failed";
  try {
    const errData = await geminiRes.json();
    errorMsg = errData?.error?.message ?? errorMsg;
  } catch {}

  return NextResponse.json({ error: errorMsg }, { status: 500 });
}
