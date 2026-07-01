import { NextRequest, NextResponse } from "next/server";
import type { IntakeFormData, GeneratedDeckContent } from "@/lib/deck-generator/types";
import { buildFallbackDeck } from "@/lib/deck-generator/fallback";

/* ================================================================== */
/*  Prompt construction                                                 */
/* ================================================================== */

const SYSTEM_INSTRUCTION = `You are a senior media strategist at 434 Media, a data-driven advertising agency.
Generate compelling, personalized pitch deck content for client proposals.
Return only a valid JSON object matching the exact schema provided — no markdown, no explanations, no extra fields.
Be specific, use the client's actual data, and keep every field concise (1–3 sentences or 3–5 bullet points).
Bullet points must start with • and be separated by \\n.`;

function buildPrompt(intake: IntakeFormData): string {
  const channels = intake.channels.join(", ") || "Paid Search, Paid Social";
  const journeyByObjective: Record<string, string> = {
    "Lead Generation": "Awareness\nSearch Intent\nWebsite Visit\nLead Form\nConsultation\nCustomer\nReferral",
    "E-Commerce Sales": "Discovery\nProduct Browse\nProduct View\nAdd to Cart\nCheckout\nRepeat Purchase\nBrand Advocate",
    "Event Attendance / Tickets": "Awareness\nEvent Discovery\nTicket Page Visit\nPurchase Intent\nTicket Sale\nEvent Attendance\nWord of Mouth",
    "Donations / Fundraising": "Awareness\nCause Discovery\nEngagement\nConsideration\nDonation\nStewardship\nAdvocacy",
    "Brand Awareness": "Impression\nRecall\nBrand Search\nWebsite Visit\nEngagement\nLoyalty\nAdvocate",
    "Website Traffic": "Impression\nClick\nLanding Page\nContent Engagement\nReturn Visit\nConversion\nSocial Share",
  };
  const journey = journeyByObjective[intake.objective] || journeyByObjective["Lead Generation"];

  const kpisByObjective: Record<string, [string, string, string]> = {
    "Lead Generation": ["Cost Per Lead", "Lead-to-Close Rate", "Conversion Rate"],
    "E-Commerce Sales": ["Return on Ad Spend", "Cost Per Purchase", "Average Order Value"],
    "Event Attendance / Tickets": ["Cost Per Ticket Sold", "Click-Through Rate", "Ticket Revenue"],
    "Donations / Fundraising": ["Cost Per Donor", "Donation Conversion Rate", "Average Gift Size"],
    "Brand Awareness": ["Reach & Frequency", "Brand Search Lift", "Video Completion Rate"],
    "Website Traffic": ["Cost Per Click", "Bounce Rate Reduction", "Pages Per Session"],
  };
  const [kpi1, kpi2, kpi3] = kpisByObjective[intake.objective] || kpisByObjective["Lead Generation"];

  return `Generate a pitch deck for this client:

Company: ${intake.companyName || "the client"}
Objective: ${intake.objective}
Why Now: ${intake.whyNow}
Geography: ${intake.geography}
Audience: ${intake.audience}
Channels: ${channels}
Budget: ${intake.budget}
Competitors: ${intake.competitors || "not specified"}
USP: ${intake.usp || "not specified"}
Notes: ${intake.notes || "none"}

Return this exact JSON structure with all 12 slides populated:

{
  "slide1": {
    "company": "${intake.companyName ? `"${intake.companyName}" or a punchy 3–5 word headline` : "A punchy 3–5 word objective headline"}",
    "subtitle": "Custom media strategy line referencing their geography and objective",
    "tagline": "One-line value prop from 434 Media's perspective"
  },
  "slide2": {
    "challenge": "3 bullet points (•) about their current marketing pain points",
    "opportunity": "3 bullet points (•) about market opportunities available to them",
    "outcome": "3 bullet points (•) about the measurable results they want"
  },
  "slide3": {
    "headline": "Bold single sentence about why the opportunity is real right now for their objective",
    "bullets": "4 bullet points (•) about why the market moment supports acting now"
  },
  "slide4": {
    "line1": "Acquisition strategy: how we capture high-intent consumers using their specific channels",
    "line2": "Education strategy: how we build trust and drive informed decisions",
    "line3": "Retention strategy: how we maximize lifetime value and referrals"
  },
  "slide5": {
    "channels": "${channels}",
    "budget": "${intake.budget || "TBD"}",
    "geography": "${intake.geography || "Target Market"}",
    "audience": "Concise 1-sentence audience description"
  },
  "slide6": {
    "point1": "Why their USP or differentiator makes this strategy strong",
    "point2": "Why the Why Now timing creates urgency and advantage",
    "point3": "Why their audience is reachable and ready to convert right now"
  },
  "slide7": {
    "primary": "Specific audience profile with demographics, psychographics, and behaviors",
    "geography": "${intake.geography || "Target market"} with geographic context",
    "notes": "Targeting approach and any special considerations from their notes"
  },
  "slide8": {
    "steps": "${journey}"
  },
  "slide9": {
    "title": "Success Story: [real-sounding case study title relevant to their objective]",
    "challenge": "A realistic challenge similar to theirs that 434 Media solved",
    "solution": "The integrated media strategy deployed — channels, targeting, creative approach",
    "outcome": "Specific, compelling results with realistic numbers (e.g. 38% reduction in CPL, 2.9x ROAS)"
  },
  "slide10": {
    "kpi1": "${kpi1}",
    "kpi2": "${kpi2}",
    "kpi3": "${kpi3}",
    "budget": "${intake.budget || "To be confirmed"}",
    "channels": "${channels}"
  },
  "slide11": {
    "strategy": "4 bullet points (•) for strategy services tailored to their objective",
    "acquisition": "4 bullet points (•) for acquisition services using their specific channels: ${channels}",
    "optimization": "4 bullet points (•) for optimization and reporting services"
  },
  "slide12": {
    "step1": "Specific first next step referencing their timeline or Why Now urgency",
    "step2": "Strategy and media plan delivery with a specific timeframe",
    "step3": "Campaign launch with live reporting dashboard",
    "closing": "Personalized closing that references ${intake.companyName || "their company"} and their objective"
  }
}

Important: Return ONLY the JSON object. Be specific to their industry and objective. Use their actual data throughout.`;
}

/* ================================================================== */
/*  Validation                                                          */
/* ================================================================== */

function validateDeckContent(data: unknown): data is GeneratedDeckContent {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const required = ["slide1","slide2","slide3","slide4","slide5","slide6","slide7","slide8","slide9","slide10","slide11","slide12"];
  for (const key of required) {
    if (!(key in d) || typeof d[key] !== "object" || d[key] === null) return false;
    const slide = d[key] as Record<string, unknown>;
    const hasStrings = Object.values(slide).every(v => typeof v === "string");
    if (!hasStrings || Object.keys(slide).length === 0) return false;
  }
  return true;
}

/* ================================================================== */
/*  Route handler                                                       */
/* ================================================================== */

export async function POST(req: NextRequest) {
  let intake: IntakeFormData;
  try {
    const body = await req.json();
    intake = body.intake;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!intake?.objective) {
    return NextResponse.json({ error: "Intake data is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      deck: buildFallbackDeck(intake),
      source: "fallback",
      warning: "No GOOGLE_AI_API_KEY set — using template-based generation. Add your key to .env.local for AI-powered slides.",
    });
  }

  const prompt = buildPrompt(intake);
  let lastError = "";

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.75,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        lastError = (errData as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
        if (res.status === 429) await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }

      const data = await res.json();
      const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!rawText) { lastError = "Empty AI response"; continue; }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]+\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); } catch { lastError = "Invalid JSON in response"; continue; }
        } else {
          lastError = "No JSON found in response";
          continue;
        }
      }

      if (!validateDeckContent(parsed)) {
        lastError = "Response is missing required slide fields";
        continue;
      }

      return NextResponse.json({ deck: parsed, source: "ai" });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
    }
  }

  console.error("[generate-deck] All retries failed:", lastError);
  return NextResponse.json({
    deck: buildFallbackDeck(intake),
    source: "fallback",
    warning: `AI generation failed (${lastError}) — using template-based fallback.`,
  });
}
