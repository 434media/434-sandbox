"use client";

import { useMemo, useState } from "react";
import {
  generateProspects,
  createProspectFromSearch,
  kpis,
  gradeCounts,
  scoreDistribution,
  scatterPoints,
  topProspects,
  ageInDays,
  getAutomatedAction,
  GRADE_COLORS,
  INDUSTRY_COLORS,
  type Prospect,
  type Grade,
  type SearchedProspect,
} from "./lib/pipeline";

/* =================================================================== */
/*  434 Media · Prospect Discovery Dashboard                           */
/*  Route: /analytics-dashboard                                        */
/* =================================================================== */

type Tab = "overview" | "quality" | "prospects" | "search";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",   label: "Overview" },
  { id: "quality",    label: "Fit × Intent" },
  { id: "prospects",  label: "Prospects" },
  { id: "search",     label: "Search & Add" },
];

/* ---- shared UI (unchanged) ---- */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white p-5 ${className}`}>
      {children}
    </div>
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

function KpiCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ${
        accent
          ? "bg-[#1e3a5f] text-white"
          : "bg-neutral-100 text-neutral-900"
      }`}
    >
      <p className={`text-[13px] ${accent ? "text-blue-200" : "text-neutral-500"}`}>{label}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums">{value}</p>
    </div>
  );
}

function GradePill({ grade }: { grade: Grade }) {
  const c = GRADE_COLORS[grade];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}
    >
      {grade}
    </span>
  );
}

function IndustryPill({ industry }: { industry: string }) {
  const cls = INDUSTRY_COLORS[industry as keyof typeof INDUSTRY_COLORS] ?? "bg-neutral-100 text-neutral-600";
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] ${cls}`}>{industry}</span>
  );
}

/* ---- Grade Panel (unchanged) ---- */

const GRADE_BAR_COLOR: Record<Grade, string> = {
  "A+": "bg-emerald-500",
  "A":  "bg-teal-400",
  "B":  "bg-sky-400",
  "C":  "bg-amber-400",
  "D":  "bg-rose-400",
};

function GradePanel({ prospects }: { prospects: Prospect[] }) {
  const rows = useMemo(() => gradeCounts(prospects), [prospects]);
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <Card>
      <PanelHead title="Grade distribution" sub="Final score A+ → D breakdown" />
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.grade} className="flex items-center gap-3">
            <span className="w-6 text-right text-[13px] font-semibold text-neutral-700">
              {r.grade}
            </span>
            <div className="relative flex-1 h-7 rounded-md bg-neutral-100">
              <div
                className={`h-full rounded-md transition-all ${GRADE_BAR_COLOR[r.grade as Grade]}`}
                style={{ width: `${Math.max((r.count / max) * 100, 4)}%` }}
              />
              <span className="absolute inset-0 flex items-center px-2.5 text-[12px] font-medium text-neutral-800">
                {r.count.toLocaleString()} &nbsp;
                <span className="font-normal text-neutral-400">({r.pct.toFixed(0)}%)</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg bg-neutral-50 border border-neutral-100 p-3 space-y-1.5">
        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Automated actions</p>
        {(["A+", "A", "B", "C"] as Grade[]).map((g) => (
          <div key={g} className="flex items-start gap-2 text-[12px]">
            <GradePill grade={g} />
            <span className="text-neutral-600">{getAutomatedAction(g)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---- Score histogram (unchanged) ---- */

function ScoreHistogram({ prospects }: { prospects: Prospect[] }) {
  const [field, setField] = useState<"finalScore" | "fitScore" | "intentScore">("finalScore");
  const bins = useMemo(() => scoreDistribution(prospects, 10, field), [prospects, field]);
  const max = Math.max(...bins.map((b) => b.count), 1);

  const labels: Record<typeof field, string> = {
    finalScore:  "Final score distribution",
    fitScore:    "Fit score distribution",
    intentScore: "Intent score distribution",
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] text-neutral-400">{labels[field]}</p>
        <div className="flex gap-1">
          {(["finalScore", "fitScore", "intentScore"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setField(f)}
              className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                field === f
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-100"
              }`}
            >
              {f === "finalScore" ? "Final" : f === "fitScore" ? "Fit" : "Intent"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex h-20 items-end gap-1">
        {bins.map((b) => (
          <div
            key={b.from}
            className="flex-1 rounded-sm bg-neutral-200 hover:bg-indigo-200 transition-colors"
            style={{ height: `${(b.count / max) * 100}%` }}
            title={`${b.from}–${b.to}: ${b.count} prospects`}
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

/* ---- Fit × Intent scatter (unchanged) ---- */

const SCATTER_GRADE_COLOR: Record<Grade, string> = {
  "A+": "#10b981",
  "A":  "#14b8a6",
  "B":  "#38bdf8",
  "C":  "#fbbf24",
  "D":  "#f87171",
};

function Scatter({ prospects }: { prospects: Prospect[] }) {
  const pts = useMemo(() => scatterPoints(prospects), [prospects]);
  const W = 320, H = 240, L = 40, R = 300, T = 16, B = 200;
  const px = (v: number) => L + (v / 100) * (R - L);
  const py = (v: number) => B - (v / 100) * (B - T);
  const TX = px(55), TY = py(60);

  return (
    <div>
      <p className="mb-2 text-[11px] text-neutral-400">
        Fit × Intent — top-right quadrant = highest priority prospects
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Scatter of prospects by Fit and Intent score"
      >
        <rect x={TX} y={T} width={R - TX} height={TY - T} fill="#f0fdf4" rx={3} />
        <text x={(TX + R) / 2} y={T + 14} textAnchor="middle" fontSize="10" fill="#059669">
          Prioritize
        </text>
        <line x1={L} y1={T} x2={L} y2={B} stroke="#d4d4d4" />
        <line x1={L} y1={B} x2={R} y2={B} stroke="#d4d4d4" />
        <line x1={TX} y1={T} x2={TX} y2={B} stroke="#e5e5e5" strokeDasharray="3 3" />
        <line x1={L} y1={TY} x2={R} y2={TY} stroke="#e5e5e5" strokeDasharray="3 3" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={px(p.x)}
            cy={py(p.y)}
            r={p.grade === "A+" ? 3.8 : p.grade === "A" ? 3.2 : 2.4}
            fill={SCATTER_GRADE_COLOR[p.grade]}
            fillOpacity={0.75}
          >
            <title>{p.company} · Fit {p.y} / Intent {p.x} · {p.grade}</title>
          </circle>
        ))}
        <text x={(L + R) / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#a3a3a3">
          Intent score →
        </text>
        <text
          x={14}
          y={(T + B) / 2}
          textAnchor="middle"
          fontSize="10"
          fill="#a3a3a3"
          transform={`rotate(-90 14 ${(T + B) / 2})`}
        >
          Fit score →
        </text>
      </svg>
      {/* legend */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {(["A+", "A", "B", "C", "D"] as Grade[]).map((g) => (
          <span key={g} className="flex items-center gap-1 text-[11px] text-neutral-500">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SCATTER_GRADE_COLOR[g] }}
            />
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}

function QualityPanel({ prospects }: { prospects: Prospect[] }) {
  return (
    <Card>
      <PanelHead title="Fit × Intent analysis" sub="Score distributions and quadrant mapping" />
      <ScoreHistogram prospects={prospects} />
      <div className="mt-5">
        <Scatter prospects={prospects} />
      </div>
    </Card>
  );
}

/* ---- Top Prospects table (unchanged) ---- */

function TopProspects({ prospects }: { prospects: Prospect[] }) {
  const [sortBy, setSortBy] = useState<"score" | "recent" | "deal">("score");
  const rows = useMemo(() => topProspects(prospects, 10, sortBy), [prospects, sortBy]);

  const sortLabels: Record<typeof sortBy, string> = {
    score:  "By score",
    recent: "By recency",
    deal:   "By deal size",
  };

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-neutral-900">Top prospects</h2>
          <p className="text-xs text-neutral-400">Highest priority targets</p>
        </div>
        <div className="flex gap-1 text-xs">
          {(["score", "recent", "deal"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`rounded-md border px-2.5 py-1 transition-colors ${
                sortBy === s
                  ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                  : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              {sortLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-[11px] uppercase tracking-wide text-neutral-400">
              <th className="pb-2 pr-4 font-medium">Company</th>
              <th className="pb-2 pr-4 font-medium">Industry</th>
              <th className="pb-2 pr-4 font-medium">Location</th>
              <th className="pb-2 pr-4 font-medium text-right">Fit</th>
              <th className="pb-2 pr-4 font-medium text-right">Intent</th>
              <th className="pb-2 pr-4 font-medium text-right">Final</th>
              <th className="pb-2 pr-4 font-medium">Grade</th>
              <th className="pb-2 font-medium text-right">Est. Deal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-2.5 pr-4">
                  <p className="font-medium text-neutral-900">{p.company}</p>
                  <p className="text-[11px] text-neutral-400">{ageInDays(p.discoveredAt)}d ago · {p.fundingStage}</p>
                </td>
                <td className="py-2.5 pr-4">
                  <IndustryPill industry={p.industry} />
                </td>
                <td className="py-2.5 pr-4 text-[13px] text-neutral-600 whitespace-nowrap">
                  {p.location}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-[13px] text-neutral-600">
                  {p.fitScore}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-[13px] text-neutral-600">
                  {p.intentScore}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-[13px] font-medium text-neutral-900">
                  {p.finalScore}
                </td>
                <td className="py-2.5 pr-4">
                  <GradePill grade={p.grade} />
                </td>
                <td className="py-2.5 text-right tabular-nums text-[13px] text-neutral-600 whitespace-nowrap">
                  ${(p.estimatedDealValue / 1000).toFixed(0)}k
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---- Morning Summary Banner (unchanged) ---- */

function MorningSummary({ k }: { k: ReturnType<typeof kpis> }) {
  return (
    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 flex flex-wrap items-center gap-x-8 gap-y-2">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">Morning summary</p>
        <p className="text-[13px] text-emerald-900 mt-0.5">
          Nightly scan complete · {k.total} companies evaluated
        </p>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
        <span className="text-emerald-800">
          <strong>{k.aPlusCount}</strong> A+ prospects ready
        </span>
        <span className="text-emerald-800">
          <strong>{k.aCount}</strong> A prospects
        </span>
        <span className="text-emerald-800">
          <strong>{k.bCount}</strong> B prospects
        </span>
        <span className="text-emerald-800">
          Pipeline value <strong>${(k.pipelineValue / 1000).toFixed(0)}k</strong>
        </span>
      </div>
    </div>
  );
}

/* ---- Search Panel with summary, sources, contact info, and tailored email ---- */

function SearchPanel({
  onAddProspect,
}: {
  onAddProspect: (p: Prospect) => void;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchedProspect | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      const prospect = createProspectFromSearch(query.trim());
      setResult(prospect);
      setIsSearching(false);
    }, 800);
  };

  const handleAdd = () => {
    if (result) {
      onAddProspect(result);
      setResult(null);
      setQuery("");
    }
  };

  return (
    <Card>
      <PanelHead
        title="Search & Add Prospect"
        sub="Enter a company name to simulate AI-powered research and grading"
      />
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Google, SpaceX, Stripe..."
            className="flex-1 rounded-md border border-neutral-300 px-4 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="rounded-md bg-[#1e3a5f] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#16304f] disabled:opacity-50"
          >
            {isSearching ? "Researching..." : "Search"}
          </button>
        </div>

        {result && (
          <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex flex-col gap-4">
              {/* Header & score */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900">{result.company}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <IndustryPill industry={result.industry} />
                    <span className="text-sm text-neutral-500">{result.location}</span>
                    <span className="text-sm text-neutral-500">{result.fundingStage}</span>
                    <span className="text-sm text-neutral-500">{result.employees} employees</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <span>Fit: <strong>{result.fitScore}</strong></span>
                    <span>Intent: <strong>{result.intentScore}</strong></span>
                    <span>Final: <strong>{result.finalScore}</strong></span>
                    <GradePill grade={result.grade} />
                    <span className="text-neutral-500">
                      Est. deal: ${(result.estimatedDealValue / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleAdd}
                  className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  Add to list
                </button>
              </div>

              {/* Contact information */}
              <div className="border-t border-neutral-200 pt-3">
                <h4 className="text-sm font-medium text-neutral-700">📞 Contact Information</h4>
                <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-neutral-600 sm:grid-cols-2">
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    <a href={`mailto:${result.contactEmail}`} className="text-blue-600 hover:underline">
                      {result.contactEmail}
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    <a href={`tel:${result.contactPhone}`} className="text-blue-600 hover:underline">
                      {result.contactPhone}
                    </a>
                  </div>
                </div>
                {result.addresses.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium">📍 Addresses:</span>
                    <ul className="mt-1 list-disc pl-5 text-sm text-neutral-600">
                      {result.addresses.map((addr, idx) => (
                        <li key={idx}>{addr}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Summary & Sources (collapsible) */}
              <div className="border-t border-neutral-200 pt-3">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900">
                    📋 Why this score? (click to expand)
                  </summary>
                  <div className="mt-2 space-y-2 text-sm text-neutral-700">
                    <p className="leading-relaxed">{result.summary}</p>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Sources:</p>
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {result.sources.map((src, idx) => (
                          <li
                            key={idx}
                            className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs text-neutral-700"
                          >
                            {src}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              </div>

              {/* Tailored Email */}
              <div className="border-t border-neutral-200 pt-3">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900">
                    ✉️ Tailored Email Draft (click to expand)
                  </summary>
                  <div className="mt-2 rounded-md bg-white p-3 text-sm font-mono whitespace-pre-wrap border border-neutral-200 text-neutral-800">
                    {result.tailoredEmail}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => navigator.clipboard?.writeText(result.tailoredEmail)}
                      className="rounded-md border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                    >
                      Copy email
                    </button>
                    <a
                      href={`mailto:${result.contactEmail}?subject=Strategic%20partnership%20opportunity%20for%20${encodeURIComponent(result.company)}&body=${encodeURIComponent(result.tailoredEmail)}`}
                      className="rounded-md bg-[#1e3a5f] px-3 py-1 text-xs text-white hover:bg-[#16304f]"
                    >
                      Open in mail
                    </a>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ---- Page ---- */

export default function ProspectDiscoveryPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [seed, setSeed] = useState(42);
  const [customProspects, setCustomProspects] = useState<Prospect[]>([]);

  const baseProspects = useMemo(() => generateProspects(120, seed), [seed]);
  const allProspects = useMemo(
    () => [...baseProspects, ...customProspects],
    [baseProspects, customProspects]
  );

  const k = useMemo(() => kpis(allProspects), [allProspects]);

  const showGrade    = tab === "overview" || tab === "prospects";
  const showQuality  = tab === "overview" || tab === "quality";
  const showTable    = tab === "overview" || tab === "prospects";
  const showSearch   = tab === "search";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-5 pt-28 pb-12">

        {/* header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h1 className="font-menda-black text-xl tracking-tight">
              Prospect Discovery Dashboard
            </h1>
            <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600">
              mock data · 434 scoring model
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
                      ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                      : "border-transparent text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="rounded-md border border-neutral-200 px-3 py-1.5 text-[13px] text-neutral-500 transition-colors hover:bg-neutral-100"
              title="Regenerate mock dataset"
            >
              Reseed
            </button>
          </div>
        </div>

        {/* morning summary */}
        <MorningSummary k={k} />

        {/* KPIs */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Total prospects" value={allProspects.length.toLocaleString()} />
          <KpiCard label="A+ prospects" value={k.aPlusCount.toLocaleString()} accent />
          <KpiCard label="A prospects" value={k.aCount.toLocaleString()} />
          <KpiCard
            label="Pipeline value (A+/A)"
            value={`$${(k.pipelineValue / 1000).toFixed(0)}k`}
          />
        </div>

        {/* secondary KPIs */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="B prospects" value={k.bCount.toLocaleString()} />
          <KpiCard label="Avg final score" value={`${k.avgFinalScore}/100`} />
          <KpiCard
            label="A+ conversion rate"
            value={`${allProspects.length > 0 ? ((k.aPlusCount / allProspects.length) * 100).toFixed(1) : 0}%`}
          />
          <KpiCard
            label="A+/A rate"
            value={`${allProspects.length > 0 ? (((k.aPlusCount + k.aCount) / allProspects.length) * 100).toFixed(1) : 0}%`}
          />
        </div>

        {/* panels */}
        {showSearch && (
          <div className="mb-4">
            <SearchPanel
              onAddProspect={(p) => setCustomProspects((prev) => [...prev, p])}
            />
          </div>
        )}

        {(showGrade || showQuality) && (
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            {showGrade   && <GradePanel   prospects={allProspects} />}
            {showQuality && <QualityPanel prospects={allProspects} />}
          </div>
        )}

        {showTable && <TopProspects prospects={allProspects} />}
      </div>
    </div>
  );
}