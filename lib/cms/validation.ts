import type { IntakeData } from "@/lib/cms/types";

const fields = ["companyName", "objective", "whyNow", "geography", "audience", "budget"] as const;

function optionalUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  const url = value.trim().slice(0, 1000);
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Unsupported protocol.");
    return parsed.toString();
  } catch {
    throw new Error("websiteUrl must be a valid http or https URL.");
  }
}

export function parseIntakeData(value: unknown): IntakeData {
  if (!value || typeof value !== "object") throw new Error("A valid intake submission is required.");
  const body = value as Record<string, unknown>;
  for (const field of fields) {
    if (typeof body[field] !== "string" || !body[field].trim()) throw new Error(`${field} is required.`);
  }
  if (!Array.isArray(body.channels) || body.channels.length === 0 || body.channels.some((item) => typeof item !== "string")) {
    throw new Error("At least one channel is required.");
  }
  const text = (key: string) => typeof body[key] === "string" ? (body[key] as string).trim().slice(0, 5000) : "";
  return {
    companyName: text("companyName").slice(0, 200),
    websiteUrl: optionalUrl(body.websiteUrl),
    objective: text("objective").slice(0, 200),
    whyNow: text("whyNow"),
    geography: text("geography").slice(0, 500),
    audience: text("audience"),
    channels: (body.channels as string[]).map((item) => item.trim().slice(0, 100)).filter(Boolean).slice(0, 20),
    budget: text("budget").slice(0, 200),
    competitors: text("competitors"),
    usp: text("usp"),
    notes: text("notes"),
  };
}

export function scoreIntake(data: IntakeData): number {
  let score = 35;
  if (data.budget === "$50k+") score += 30;
  else if (data.budget === "$15–50k") score += 22;
  else if (data.budget === "$5–15k") score += 12;
  if (data.channels.length >= 3) score += 10;
  if (data.usp) score += 8;
  if (data.competitors) score += 7;
  if (data.notes) score += 5;
  if (data.whyNow.length >= 40) score += 5;
  return Math.min(100, score);
}
