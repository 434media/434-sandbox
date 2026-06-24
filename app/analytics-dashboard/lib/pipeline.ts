export type Stage =
  | "LEAD"
  | "MQL"
  | "SQL"
  | "DISCOVERY"
  | "PROPOSAL"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export interface Lead {
  id: string;
  source: string;
  stage: Stage;
  createdAt: Date;
  leadQualityScore: number; // 0–100
  icpFit: number;           // 0–100
  intent: number;           // 0–100
  account?: { name: string };
}

export const STAGE_LABELS: Record<Stage, string> = {
  LEAD: "Lead",
  MQL: "MQL",
  SQL: "SQL",
  DISCOVERY: "Discovery",
  PROPOSAL: "Proposal",
  CLOSED_WON: "Closed won",
  CLOSED_LOST: "Closed lost",
};

export const ICP_MATCH_THRESHOLD = 60;
export const HIGH_INTENT_THRESHOLD = 55;

const STAGES: Stage[] = [
  "LEAD",
  "MQL",
  "SQL",
  "DISCOVERY",
  "PROPOSAL",
  "CLOSED_WON",
  "CLOSED_LOST",
];

const SOURCES = ["Organic", "Outbound", "Referral", "Paid", "Event", "Partner"];
const COMPANIES = [
  "Acme Corp", "Northwind", "Contoso", "Fabrikam", "Litware",
  "AdventureWorks", "Tailspin", "Coho Winery", "Trey Research", "Woodgrove",
];

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

export function generateLeads(count: number, seed: number): Lead[] {
  const rng = seededRng(seed);
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const stageRoll = rng();
    const stage: Stage =
      stageRoll < 0.3
        ? "LEAD"
        : stageRoll < 0.52
        ? "MQL"
        : stageRoll < 0.66
        ? "SQL"
        : stageRoll < 0.76
        ? "DISCOVERY"
        : stageRoll < 0.83
        ? "PROPOSAL"
        : stageRoll < 0.88
        ? "CLOSED_WON"
        : "CLOSED_LOST";

    const icpFit = Math.round(rng() * 100);
    const intent = Math.round(rng() * 100);
    const leadQualityScore = Math.round((icpFit * 0.5 + intent * 0.5) * (0.7 + rng() * 0.3));
    const daysAgo = Math.round(rng() * 180);

    return {
      id: `LD-${String(i + 1).padStart(4, "0")}`,
      source: SOURCES[Math.floor(rng() * SOURCES.length)],
      stage,
      createdAt: new Date(now - daysAgo * 86_400_000),
      leadQualityScore: Math.min(100, leadQualityScore),
      icpFit,
      intent,
      account: {
        name: COMPANIES[Math.floor(rng() * COMPANIES.length)],
      },
    };
  });
}

export function ageInDays(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

export function funnelCounts(
  leads: Lead[]
): {
  stage: Stage;
  label: string;
  count: number;
  reachedPct: number;
  convFromPrev: number;
  dropFromPrev: number;
}[] {
  const FUNNEL_STAGES: Stage[] = [
    "LEAD", "MQL", "SQL", "DISCOVERY", "PROPOSAL", "CLOSED_WON",
  ];

  const total = leads.length;
  const counts: Record<Stage, number> = {} as Record<Stage, number>;
  for (const s of STAGES) counts[s] = 0;
  for (const l of leads) counts[l.stage]++;

  // cumulative reached: everyone who passed through or is currently at each stage
  const stageOrder = FUNNEL_STAGES;
  const stageIndex: Record<Stage, number> = {} as Record<Stage, number>;
  stageOrder.forEach((s, i) => { stageIndex[s] = i; });

  const reached: Record<Stage, number> = {} as Record<Stage, number>;
  for (const s of stageOrder) {
    const idx = stageIndex[s];
    reached[s] = leads.filter(
      (l) => stageIndex[l.stage] !== undefined && stageIndex[l.stage] >= idx
    ).length;
  }

  return stageOrder.map((stage, i) => {
    const count = reached[stage];
    const prev = i > 0 ? reached[stageOrder[i - 1]] : total;
    const convFromPrev = prev > 0 ? (count / prev) * 100 : 0;
    const dropFromPrev = 100 - convFromPrev;
    return {
      stage,
      label: STAGE_LABELS[stage],
      count,
      reachedPct: total > 0 ? (count / total) * 100 : 0,
      convFromPrev,
      dropFromPrev,
    };
  });
}

export function kpis(leads: Lead[]): {
  pipelineVolume: number;
  icpMatchRate: number;
  leadToCustomer: number;
  avgCycleDays: number;
} {
  const total = leads.length;
  const icpMatched = leads.filter((l) => l.icpFit >= ICP_MATCH_THRESHOLD).length;
  const closedWon = leads.filter((l) => l.stage === "CLOSED_WON");
  const avgCycle =
    closedWon.length > 0
      ? closedWon.reduce((sum, l) => sum + ageInDays(l.createdAt), 0) / closedWon.length
      : 0;

  return {
    pipelineVolume: total,
    icpMatchRate: total > 0 ? (icpMatched / total) * 100 : 0,
    leadToCustomer: total > 0 ? (closedWon.length / total) * 100 : 0,
    avgCycleDays: avgCycle,
  };
}

export function scoreDistribution(
  leads: Lead[],
  binCount: number
): { from: number; to: number; count: number }[] {
  const step = 100 / binCount;
  return Array.from({ length: binCount }, (_, i) => {
    const from = Math.round(i * step);
    const to = Math.round((i + 1) * step);
    return {
      from,
      to,
      count: leads.filter((l) => l.leadQualityScore >= from && l.leadQualityScore < to).length,
    };
  });
}

export function scatterPoints(
  leads: Lead[]
): { x: number; y: number; prioritized: boolean }[] {
  return leads.map((l) => ({
    x: l.intent,
    y: l.icpFit,
    prioritized: l.intent >= HIGH_INTENT_THRESHOLD && l.icpFit >= ICP_MATCH_THRESHOLD,
  }));
}

export function topLeads(
  leads: Lead[],
  count: number,
  sortBy: "score" | "recent"
): Lead[] {
  const sorted = [...leads].sort((a, b) =>
    sortBy === "score"
      ? b.leadQualityScore - a.leadQualityScore
      : b.createdAt.getTime() - a.createdAt.getTime()
  );
  return sorted.slice(0, count);
}
