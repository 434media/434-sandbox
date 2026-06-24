"use client";

import { useMemo, useState } from "react";
import {
  generateLeads,
  funnelCounts,
  kpis,
  scoreDistribution,
  scatterPoints,
  topLeads,
  ageInDays,
  STAGE_LABELS,
  ICP_MATCH_THRESHOLD,
  HIGH_INTENT_THRESHOLD,
  type Lead,
  type Stage,
} from "./lib/pipeline";

/* =================================================================== */
/*  Pipeline Health — Phase 1 internal dashboard (mock data)            */
/*  Route: /pipeline-health                                             */
/*                                                                     */
/*  Charts are hand-rolled in SVG / Tailwind so this drops in with no   */
/*  new dependencies. To upgrade later, the derived data from           */
/*  ./lib/pipeline feeds straight into Recharts or Tremor unchanged.    */
/* =================================================================== */

type Tab = "overview" | "quality" | "funnel";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "quality", label: "Lead quality" },
  { id: "funnel", label: "Funnel" },
];

const ACCENT = "#4f46e5"; // indigo-600

const STAGE_PILL: Record<Stage, string> = {
  LEAD: "bg-neutral-100 text-neutral-600",
  MQL: "bg-indigo-50 text-indigo-700",
  SQL: "bg-indigo-100 text-indigo-700",
  DISCOVERY: "bg-violet-100 text-violet-700",
  PROPOSAL: "bg-amber-100 text-amber-700",
  CLOSED_WON: "bg-emerald-100 text-emerald-700",
  CLOSED_LOST: "bg-rose-100 text-rose-700",
};

/* ----------------------------- helpers ----------------------------- */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white p-5 ${className}`}>{children}</div>
  );
}

function PanelHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-medium text-neutral-900">{title}</h2>
      <p className="text-xs text-neutral-400">{sub}</p>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-4">
      <p className="text-[13px] text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums text-neutral-900">{value}</p>
    </div>
  );
}

/* ------------------------------ panels ----------------------------- */

function FunnelPanel({ leads }: { leads: Lead[] }) {
  const rows = useMemo(() => funnelCounts(leads), [leads]);
  return (
    <Card>
      <PanelHead title="Funnel health" sub="Conversion and drop-off by stage" />
      <div className="space-y-1">
        {rows.map((r, i) => (
          <div key={r.stage}>
            {i > 0 && (
              <p className="py-1 pr-1 text-right text-[11px] text-neutral-400 tabular-nums">
                {r.convFromPrev.toFixed(0)}% advanced · −{r.dropFromPrev.toFixed(0)}% drop-off
              </p>
            )}
            <div
              className="flex h-9 items-center rounded-md bg-indigo-50 px-3 text-xs"
              style={{ width: `${Math.max(r.reachedPct, 16)}%` }}
              title={`${r.label}: ${r.count.toLocaleString()} reached`}
            >
              <span className="font-medium text-indigo-900">{r.label}</span>
              <span className="ml-auto pl-3 tabular-nums text-indigo-700">
                {r.count.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ScoreHistogram({ leads }: { leads: Lead[] }) {
  const bins = useMemo(() => scoreDistribution(leads, 10), [leads]);
  const max = Math.max(...bins.map((b) => b.count), 1);
  return (
    <div>
      <p className="mb-2 text-[11px] text-neutral-400">Lead quality score distribution</p>
      <div className="flex h-20 items-end gap-1">
        {bins.map((b) => (
          <div
            key={b.from}
            className="flex-1 rounded-sm bg-neutral-200"
            style={{ height: `${(b.count / max) * 100}%` }}
            title={`${b.from}–${b.to}: ${b.count.toLocaleString()} leads`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

function Scatter({ leads }: { leads: Lead[] }) {
  const pts = useMemo(() => scatterPoints(leads), [leads]);
  const W = 320,
    H = 240,
    L = 40,
    R = 300,
    T = 16,
    B = 200;
  const px = (intent: number) => L + (intent / 100) * (R - L);
  const py = (icp: number) => B - (icp / 100) * (B - T);
  const tx = px(HIGH_INTENT_THRESHOLD);
  const ty = py(ICP_MATCH_THRESHOLD);

  return (
    <div>
      <p className="mb-2 text-[11px] text-neutral-400">
        ICP fit × intent — high / high is the prioritize quadrant
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Scatter of leads by ICP fit and intent">
        <rect x={tx} y={T} width={R - tx} height={ty - T} fill="#eef2ff" rx={3} />
        <text x={(tx + R) / 2} y={T + 16} textAnchor="middle" fontSize="11" fill={ACCENT}>
          Prioritize
        </text>
        {/* axes */}
        <line x1={L} y1={T} x2={L} y2={B} stroke="#d4d4d4" />
        <line x1={L} y1={B} x2={R} y2={B} stroke="#d4d4d4" />
        {/* thresholds */}
        <line x1={tx} y1={T} x2={tx} y2={B} stroke="#e5e5e5" strokeDasharray="3 3" />
        <line x1={L} y1={ty} x2={R} y2={ty} stroke="#e5e5e5" strokeDasharray="3 3" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={px(p.x)}
            cy={py(p.y)}
            r={p.prioritized ? 3.4 : 2.8}
            fill={p.prioritized ? ACCENT : "#a3a3a3"}
            fillOpacity={p.prioritized ? 0.9 : 0.5}
          />
        ))}
        <text x={(L + R) / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#a3a3a3">
          Intent →
        </text>
        <text x={14} y={(T + B) / 2} textAnchor="middle" fontSize="11" fill="#a3a3a3" transform={`rotate(-90 14 ${(T + B) / 2})`}>
          ICP fit →
        </text>
      </svg>
    </div>
  );
}

function QualityPanel({ leads }: { leads: Lead[] }) {
  return (
    <Card>
      <PanelHead title="Lead quality" sub="Score distribution and ICP fit × intent" />
      <ScoreHistogram leads={leads} />
      <div className="mt-5">
        <Scatter leads={leads} />
      </div>
    </Card>
  );
}

function TopLeads({ leads }: { leads: Lead[] }) {
  const [sortBy, setSortBy] = useState<"score" | "recent">("score");
  const rows = useMemo(() => topLeads(leads, 8, sortBy), [leads, sortBy]);

  return (
    <Card>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-base font-medium text-neutral-900">Top leads</h2>
          <p className="text-xs text-neutral-400">Highest priority first</p>
        </div>
        <div className="flex gap-1 text-xs">
          {(["score", "recent"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`rounded-md border px-2.5 py-1 transition-colors ${
                sortBy === s
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              {s === "score" ? "By score" : "By recency"}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {rows.map((l) => (
          <div key={l.id} className="flex items-center gap-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-medium uppercase text-neutral-500">
              {l.source.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-neutral-900">
                {l.id} · {l.account?.name}
              </p>
              <p className="truncate text-xs text-neutral-400">
                {l.source} · {ageInDays(l.createdAt)}d ago
              </p>
            </div>
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] tabular-nums text-neutral-600">
              score {l.leadQualityScore}
            </span>
            <span className={`rounded-md px-2 py-0.5 text-[11px] ${STAGE_PILL[l.stage]}`}>
              {STAGE_LABELS[l.stage]}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------- page ------------------------------ */

export default function PipelineHealthPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [seed, setSeed] = useState(42);

  const leads = useMemo(() => generateLeads(1240, seed), [seed]);
  const k = useMemo(() => kpis(leads), [leads]);

  const showFunnel = tab === "overview" || tab === "funnel";
  const showQuality = tab === "overview" || tab === "quality";
  const showLeads = tab === "overview" || tab === "quality";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-5 pt-28 pb-8">
        {/* header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h1 className="font-menda-black text-xl tracking-tight">Pipeline health</h1>
            <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600">
              Phase 1 · mock data
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-md border px-3 py-1.5 text-[13px] transition-colors ${
                    tab === t.id
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-transparent text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <span
                className="cursor-not-allowed rounded-md border border-transparent px-3 py-1.5 text-[13px] text-neutral-300"
                title="Phase 2 — needs stage timestamps flowing"
              >
                Velocity
              </span>
            </div>
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="rounded-md border border-neutral-200 px-3 py-1.5 text-[13px] text-neutral-500 transition-colors hover:bg-neutral-100"
              title="Regenerate the mock dataset"
            >
              Reseed
            </button>
          </div>
        </div>

        {/* kpis */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Pipeline volume" value={k.pipelineVolume.toLocaleString()} />
          <KpiCard label="ICP match rate" value={`${k.icpMatchRate.toFixed(0)}%`} />
          <KpiCard label="Lead → customer" value={`${k.leadToCustomer.toFixed(1)}%`} />
          <KpiCard label="Avg cycle" value={`${k.avgCycleDays.toFixed(0)}d`} />
        </div>

        {/* panels */}
        {(showFunnel || showQuality) && (
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            {showFunnel && <FunnelPanel leads={leads} />}
            {showQuality && <QualityPanel leads={leads} />}
          </div>
        )}

        {showLeads && <TopLeads leads={leads} />}
      </div>
    </div>
  );
}
