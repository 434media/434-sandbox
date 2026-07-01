type DeckEmail = {
  clientName: string;
  clientEmail: string;
  projectName: string;
  message?: string;
  filename: string;
  pdf: Buffer;
};

export async function sendDeckEmail(input: DeckEmail): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.DECK_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("Email is not configured. Set RESEND_API_KEY and DECK_EMAIL_FROM.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.clientEmail],
      subject: `${input.projectName} — 434 Media Pitch Deck`,
      text: `Hi ${input.clientName || "there"},\n\n${input.message?.trim() || "Attached is your personalized pitch deck from 434 Media."}\n\nBest,\n434 Media`,
      attachments: [{ filename: input.filename, content: input.pdf.toString("base64") }],
    }),
  });
  const result = await response.json() as { id?: string; message?: string };
  if (!response.ok || !result.id) throw new Error(result.message || "Email provider rejected the message.");
  return result.id;
}
