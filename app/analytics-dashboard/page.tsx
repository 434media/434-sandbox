"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
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

/* ---- Tabs ---- */
type Tab = "overview" | "quality" | "prospects" | "search" | "automation";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview",   label: "Overview" },
  { id: "quality",    label: "Fit × Intent" },
  { id: "prospects",  label: "Prospects" },
  { id: "search",     label: "Search & Add" },
  { id: "automation", label: "Automation" },
];

/* ---- Shared UI components ---- */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {children}
    </motion.div>
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

function KpiCard({ label, value, accent = false, delay = 0 }: { label: string; value: string; accent?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`rounded-xl p-4 ${accent ? "bg-gradient-to-br from-[#1e3a5f] to-[#2a4a7f] text-white" : "bg-neutral-100 text-neutral-900"}`}
    >
      <p className={`text-[13px] ${accent ? "text-blue-200" : "text-neutral-500"}`}>{label}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums">{value}</p>
    </motion.div>
  );
}

function GradePill({ grade }: { grade: Grade }) {
  const c = GRADE_COLORS[grade];
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}>
      {grade}
    </span>
  );
}

function IndustryPill({ industry }: { industry: string }) {
  const cls = INDUSTRY_COLORS[industry as keyof typeof INDUSTRY_COLORS] ?? "bg-neutral-100 text-neutral-600";
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] ${cls}`}>{industry}</span>;
}

/* ---- Grade Panel ---- */
const GRADE_BAR_COLOR: Record<Grade, string> = {
  "A+": "bg-emerald-500",
  "A":  "bg-teal-400",
  "B":  "bg-sky-400",
  "C":  "bg-amber-400",
  "D":  "bg-rose-400",
};

function GradePanel({ prospects }: { prospects: Prospect[] }) {
  const rows = useMemo(() => gradeCounts(prospects), [prospects]);
  const max = Math.max(...rows.map(r => r.count), 1);
  return (
    <Card>
      <PanelHead title="Grade distribution" sub="Final score A+ → D breakdown" />
      <div className="space-y-3">
        {rows.map((r, idx) => (
          <motion.div key={r.grade} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="flex items-center gap-3">
            <span className="w-6 text-right text-[13px] font-semibold text-neutral-700">{r.grade}</span>
            <div className="relative flex-1 h-7 rounded-md bg-neutral-100">
              <motion.div className={`h-full rounded-md transition-all ${GRADE_BAR_COLOR[r.grade as Grade]}`} initial={{ width: 0 }} animate={{ width: `${Math.max((r.count / max) * 100, 4)}%` }} transition={{ duration: 0.6, delay: idx * 0.05 }} />
              <span className="absolute inset-0 flex items-center px-2.5 text-[12px] font-medium text-neutral-800">
                {r.count.toLocaleString()} &nbsp;<span className="font-normal text-neutral-400">({r.pct.toFixed(0)}%)</span>
              </span>
            </div>
          </motion.div>
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

/* ---- Score Histogram ---- */
function ScoreHistogram({ prospects }: { prospects: Prospect[] }) {
  const [field, setField] = useState<"finalScore" | "fitScore" | "intentScore">("finalScore");
  const bins = useMemo(() => scoreDistribution(prospects, 10, field), [prospects, field]);
  const max = Math.max(...bins.map(b => b.count), 1);
  const labels = { finalScore: "Final score distribution", fitScore: "Fit score distribution", intentScore: "Intent score distribution" };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] text-neutral-400">{labels[field]}</p>
        <div className="flex gap-1">
          {(["finalScore", "fitScore", "intentScore"] as const).map((f) => (
            <button key={f} onClick={() => setField(f)} className={`rounded px-2 py-0.5 text-[11px] transition-colors ${field === f ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-100"}`}>
              {f === "finalScore" ? "Final" : f === "fitScore" ? "Fit" : "Intent"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex h-20 items-end gap-1">
        {bins.map((b, idx) => (
          <motion.div key={b.from} className="flex-1 rounded-sm bg-neutral-200 hover:bg-indigo-300 transition-colors cursor-pointer" initial={{ height: 0 }} animate={{ height: `${(b.count / max) * 100}%` }} transition={{ duration: 0.4, delay: idx * 0.02 }} title={`${b.from}–${b.to}: ${b.count} prospects`} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-neutral-400"><span>0</span><span>50</span><span>100</span></div>
    </div>
  );
}

/* ---- Scatter (fixed dotVariants) ---- */
const SCATTER_GRADE_COLOR: Record<Grade, string> = { "A+": "#10b981", "A": "#14b8a6", "B": "#38bdf8", "C": "#fbbf24", "D": "#f87171" };

function Scatter({ prospects }: { prospects: Prospect[] }) {
  const pts = useMemo(() => scatterPoints(prospects), [prospects]);
  const W = 320, H = 240, L = 40, R = 300, T = 16, B = 200;
  const px = (v: number) => L + (v / 100) * (R - L);
  const py = (v: number) => B - (v / 100) * (B - T);
  const TX = px(55), TY = py(60);

  // ✅ FIXED: added `as const` to repeatType and ease
  const dotVariants = {
    idle: (i: number) => ({
      y: 0,
      x: 0,
      transition: {
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        delay: i * 0.02,
        ease: "easeInOut" as const,
      },
    }),
    hover: { y: -6, scale: 1.4, transition: { duration: 0.2 } },
    tap: { scale: 0.8, transition: { duration: 0.1 } },
  };

  const handleDotClick = (company: string, grade: Grade, fit: number, intent: number) => {
    alert(`${company}\nGrade: ${grade}\nFit: ${fit}\nIntent: ${intent}\n\nClick "Search & Add" to add this prospect.`);
  };

  return (
    <div>
      <p className="mb-2 text-[11px] text-neutral-400">Fit × Intent — top-right quadrant = highest priority prospects. <strong>Click any dot</strong> for details.</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Scatter of prospects by Fit and Intent score">
        <rect x={TX} y={T} width={R - TX} height={TY - T} fill="#f0fdf4" rx={3} />
        <text x={(TX + R) / 2} y={T + 14} textAnchor="middle" fontSize="10" fill="#059669">Prioritize</text>
        <line x1={L} y1={T} x2={L} y2={B} stroke="#d4d4d4" />
        <line x1={L} y1={B} x2={R} y2={B} stroke="#d4d4d4" />
        <line x1={TX} y1={T} x2={TX} y2={B} stroke="#e5e5e5" strokeDasharray="3 3" />
        <line x1={L} y1={TY} x2={R} y2={TY} stroke="#e5e5e5" strokeDasharray="3 3" />
        {pts.map((p, i) => {
          const cx = px(p.x), cy = py(p.y);
          const r = p.grade === "A+" ? 4.5 : p.grade === "A" ? 3.8 : 3;
          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill={SCATTER_GRADE_COLOR[p.grade]}
              fillOpacity={0.8}
              stroke="white"
              strokeWidth={1.5}
              style={{ cursor: "pointer" }}
              animate="idle"
              custom={i}
              variants={dotVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleDotClick(p.company, p.grade, p.y, p.x)}
              title={`${p.company} · Fit ${p.y} / Intent ${p.x} · ${p.grade}`}
            />
          );
        })}
        <text x={(L + R) / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#a3a3a3">Intent score →</text>
        <text x={14} y={(T + B) / 2} textAnchor="middle" fontSize="10" fill="#a3a3a3" transform={`rotate(-90 14 ${(T + B) / 2})`}>Fit score →</text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {(["A+", "A", "B", "C", "D"] as Grade[]).map((g) => (
          <span key={g} className="flex items-center gap-1 text-[11px] text-neutral-500">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SCATTER_GRADE_COLOR[g] }} />
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
      <div className="mt-5"><Scatter prospects={prospects} /></div>
    </Card>
  );
}

/* ---- Top Prospects table ---- */
function TopProspects({ prospects, onDeleteProspect }: { prospects: Prospect[]; onDeleteProspect: (id: string) => void }) {
  const [sortBy, setSortBy] = useState<"score" | "recent" | "deal">("score");
  const rows = useMemo(() => topProspects(prospects, 20, sortBy), [prospects, sortBy]);
  const sortLabels = { score: "By score", recent: "By recency", deal: "By deal size" };
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-base font-medium text-neutral-900">Top prospects</h2><p className="text-xs text-neutral-400">Highest priority targets</p></div>
        <div className="flex gap-1 text-xs">
          {(["score", "recent", "deal"] as const).map((s) => (
            <button key={s} onClick={() => setSortBy(s)} className={`rounded-md border px-2.5 py-1 transition-colors ${sortBy === s ? "border-[#1e3a5f] bg-[#1e3a5f] text-white" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"}`}>
              {sortLabels[s]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-[11px] uppercase tracking-wide text-neutral-400">
              <th className="pb-2 pr-4 font-medium">Company</th><th className="pb-2 pr-4 font-medium">Industry</th><th className="pb-2 pr-4 font-medium">Location</th>
              <th className="pb-2 pr-4 font-medium text-right">Fit</th><th className="pb-2 pr-4 font-medium text-right">Intent</th><th className="pb-2 pr-4 font-medium text-right">Final</th>
              <th className="pb-2 pr-4 font-medium">Grade</th><th className="pb-2 pr-4 font-medium text-right">Est. Deal</th><th className="pb-2 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            <AnimatePresence>
              {rows.map((p) => (
                <motion.tr key={p.id} initial={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 pr-4"><p className="font-medium text-neutral-900">{p.company}</p><p className="text-[11px] text-neutral-400">{ageInDays(p.discoveredAt)}d ago · {p.fundingStage}</p></td>
                  <td className="py-2.5 pr-4"><IndustryPill industry={p.industry} /></td>
                  <td className="py-2.5 pr-4 text-[13px] text-neutral-600 whitespace-nowrap">{p.location}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-[13px] text-neutral-600">{p.fitScore}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-[13px] text-neutral-600">{p.intentScore}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-[13px] font-medium text-neutral-900">{p.finalScore}</td>
                  <td className="py-2.5 pr-4"><GradePill grade={p.grade} /></td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-[13px] text-neutral-600 whitespace-nowrap">${(p.estimatedDealValue / 1000).toFixed(0)}k</td>
                  <td className="py-2.5 text-center">
                    <button onClick={() => onDeleteProspect(p.id)} className="text-rose-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50" title="Delete prospect">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---- Morning Summary with Scan button ---- */
function MorningSummary({ k, onScan, isScanning }: { k: ReturnType<typeof kpis>; onScan: () => void; isScanning: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-5 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-y-2">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">Morning summary</p>
          <p className="text-[13px] text-emerald-900 mt-0.5">{isScanning ? "⏳ Scanning for new prospects..." : `Nightly scan complete · ${k.total} companies evaluated`}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
          <span className="text-emerald-800"><strong>{k.aPlusCount}</strong> A+ prospects ready</span>
          <span className="text-emerald-800"><strong>{k.aCount}</strong> A prospects</span>
          <span className="text-emerald-800"><strong>{k.bCount}</strong> B prospects</span>
          <span className="text-emerald-800">Pipeline value <strong>${(k.pipelineValue / 1000).toFixed(0)}k</strong></span>
        </div>
      </div>
      <button onClick={onScan} disabled={isScanning} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${isScanning ? "bg-emerald-200 text-emerald-700 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"}`}>
        {isScanning ? <span className="flex items-center gap-2"><span className="animate-spin h-3 w-3 border-2 border-emerald-700 border-t-transparent rounded-full" /> Scanning...</span> : "🔄 Scan now"}
      </button>
    </motion.div>
  );
}

/* ---- Search Panel (no API) ---- */
function SearchPanel({ onAddProspect }: { onAddProspect: (p: Prospect) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState<SearchedProspect | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const getLocalSuggestions = (q: string) => {
    const lower = q.toLowerCase();
    const all = [
      'Google','Microsoft','Amazon','Apple','Meta','Tesla','SpaceX','Stripe','Shopify','Salesforce',
      'Adobe','Oracle','IBM','Cisco','Intel','NVIDIA','AMD','Qualcomm','Texas Instruments','Dell',
      'HP','Hewlett Packard Enterprise','AT&T','Verizon','T-Mobile','Walmart','Target','Costco',
      'Home Depot','Lowe\'s','Kroger','ExxonMobil','Chevron','ConocoPhillips','Phillips 66','Valero',
      'United Airlines','American Airlines','Southwest Airlines','Delta','JPMorgan Chase','Bank of America',
      'Wells Fargo','Goldman Sachs','Morgan Stanley','Citigroup','Visa','Mastercard','American Express',
      'Pfizer','Johnson & Johnson','Merck','AbbVie','Eli Lilly','UnitedHealth Group','CVS Health','Cigna',
      'Humana','Aetna',
      ...['Darkhive','SIGA Technologies','CrowdStrike','Shift5','Narf Industries','Dcode','CACI International',
        'Leidos','Parsons Corp','Booz Allen Hamilton','Palo Alto Networks','SentinelOne','Claroty',
        'Armis Security','Dragos','CEVA Biosciences','Natera','GenMark Diagnostics','BioAtla','Veracyte',
        'Accenture Federal','Deloitte Government','SAIC','ManTech International','Peraton','Palantir Technologies',
        'Anduril Industries','Shield AI','Rebellion Defense','Epirus','Capital Factory','Techstars',
        'Plug and Play','Station Houston','SKY Socially','Roper Technologies','SPX Technologies',
        'Curtiss-Wright','Moog Inc','TransDigm','H-E-B','Frost Bank','Valero Energy','NuStar Energy',
        'Rackspace','Forcepoint','Trustwave','Digital Defense','Coalfire','Rapid7','Austin Ventures',
        'LiveOak VC','Silverton Partners','Mercury Fund','S3 Ventures']
    ];
    return all.filter(name => name.toLowerCase().includes(lower)).slice(0, 10);
  };

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const results = getLocalSuggestions(query);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setShowSuggestions(false);
    await new Promise(resolve => setTimeout(resolve, 800));
    const prospect = createProspectFromSearch(query.trim());
    setResult(prospect);
    setIsSearching(false);
  };

  const handleAdd = () => {
    if (result) {
      onAddProspect(result);
      setResult(null);
      setQuery("");
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (company: string) => {
    setQuery(company);
    setShowSuggestions(false);
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const prospect = createProspectFromSearch(company);
    setResult(prospect);
    setIsSearching(false);
  };

  return (
    <Card>
      <PanelHead title="Search & Add Prospect" sub="Enter a company name for AI-powered research and grading" />
      <div className="flex flex-col gap-4">
        <div className="relative" ref={searchRef}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for any company (e.g., Google, SpaceX, Stripe)..."
                className="w-full rounded-md border border-neutral-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="rounded-md bg-[#1e3a5f] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#16304f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Researching...
                </span>
              ) : "Search"}
            </button>
          </div>
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg"
              >
                {suggestions.map((company, idx) => (
                  <motion.li
                    key={company}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => handleSelectSuggestion(company)}
                    className="px-4 py-2.5 text-sm text-neutral-700 hover:bg-[#1e3a5f]/5 cursor-pointer transition-colors border-b border-neutral-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {company}
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
            >
              <div className="flex flex-col gap-4">
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
                      <span className="text-neutral-500">Est. deal: ${(result.estimatedDealValue / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <button onClick={handleAdd} className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                    Add to list
                  </button>
                </div>

                <div className="border-t border-neutral-200 pt-3">
                  <h4 className="text-sm font-medium text-neutral-700">📞 Contact Information</h4>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-neutral-600 sm:grid-cols-2">
                    <div><span className="font-medium">Email:</span> <a href={`mailto:${result.contactEmail}`} className="text-blue-600 hover:underline">{result.contactEmail}</a></div>
                    <div><span className="font-medium">Phone:</span> <a href={`tel:${result.contactPhone}`} className="text-blue-600 hover:underline">{result.contactPhone}</a></div>
                  </div>
                  {result.addresses.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">📍 Addresses:</span>
                      <ul className="mt-1 list-disc pl-5 text-sm text-neutral-600">
                        {result.addresses.map((addr, idx) => <li key={idx}>{addr}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-200 pt-3">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900">
                      📋 Why this score? (click to expand)
                    </summary>
                    <div className="mt-2 space-y-2 text-sm text-neutral-700 whitespace-pre-wrap">
                      <p className="leading-relaxed">{result.summary}</p>
                      <div>
                        <p className="text-xs font-medium text-neutral-500">Sources:</p>
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {result.sources.map((src, idx) => <li key={idx} className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs text-neutral-700">{src}</li>)}
                        </ul>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="border-t border-neutral-200 pt-3">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900">
                      ✉️ Tailored Email Draft (click to expand)
                    </summary>
                    <div className="mt-2 rounded-md bg-white p-3 text-sm font-mono whitespace-pre-wrap border border-neutral-200 text-neutral-800">
                      {result.tailoredEmail}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => navigator.clipboard?.writeText(result.tailoredEmail)} className="rounded-md border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-100 transition-colors">
                        Copy email
                      </button>
                      <a href={`mailto:${result.contactEmail}?subject=Strategic%20partnership%20opportunity%20for%20${encodeURIComponent(result.company)}&body=${encodeURIComponent(result.tailoredEmail)}`} className="rounded-md bg-[#1e3a5f] px-3 py-1 text-xs text-white hover:bg-[#16304f] transition-colors">
                        Open in mail
                      </a>
                    </div>
                  </details>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

/* ---- Action Preview Modal ---- */
function ActionPreviewModal({ isOpen, onClose, onConfirm, prospects, grade, action }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void; prospects: Prospect[]; grade: Grade; action: string;
}) {
  const getActionDetails = (g: Grade) => {
    switch (g) {
      case "A+": return { email: "Personalized outreach email (see tailored draft)", linkedin: "Connection request + follow-up message", call: "Cold call script with value propositions", crm: "Create/update deal record, notify sales team" };
      case "A": return { email: "Standard outreach email (personalized)", linkedin: "Connection request", call: "Not applicable", crm: "Create follow-up task in CRM" };
      case "B": return { email: "Nurture email (educational content)", linkedin: "Add to LinkedIn sales navigator", call: "Not applicable", crm: "Add to nurture campaign" };
      default: return { email: "No email action", linkedin: "No LinkedIn action", call: "No call action", crm: "Store only" };
    }
  };
  const details = getActionDetails(grade);
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Confirm Action</h2>
                <p className="text-sm text-neutral-500">{prospects.length === 1 ? `Prospect: ${prospects[0].company} (Grade ${grade})` : `${prospects.length} prospects (Grade ${grade})`}</p>
              </div>
              <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-lg p-4"><p className="text-sm font-medium text-neutral-700">Action: <span className="font-normal">{action}</span></p></div>
              <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                <div className="p-3 flex items-start gap-3"><span className="text-sm font-medium text-neutral-700 w-20">📧 Email</span><span className="text-sm text-neutral-600">{details.email}</span></div>
                <div className="p-3 flex items-start gap-3"><span className="text-sm font-medium text-neutral-700 w-20">🔗 LinkedIn</span><span className="text-sm text-neutral-600">{details.linkedin}</span></div>
                <div className="p-3 flex items-start gap-3"><span className="text-sm font-medium text-neutral-700 w-20">📞 Call</span><span className="text-sm text-neutral-600">{details.call}</span></div>
                <div className="p-3 flex items-start gap-3"><span className="text-sm font-medium text-neutral-700 w-20">📋 CRM</span><span className="text-sm text-neutral-600">{details.crm}</span></div>
              </div>
              {prospects.length > 1 && (
                <div className="border border-neutral-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Affected prospects</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {prospects.map(p => <div key={p.id} className="text-sm text-neutral-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-neutral-300" />{p.company}</div>)}
                  </div>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">⚠️ This action will send real outreach (emails, LinkedIn messages, etc.) and update your CRM. Please review the details above before confirming.</div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">Cancel</button>
              <button onClick={onConfirm} className="px-6 py-2 text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#16304f] rounded-md transition-colors active:scale-95">Confirm & Execute</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---- Automation Panel ---- */
function AutomationPanel({ prospects }: { prospects: Prospect[] }) {
  const [executing, setExecuting] = useState<{ [key: string]: boolean }>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProspects, setModalProspects] = useState<Prospect[]>([]);
  const [modalGrade, setModalGrade] = useState<Grade>("A+");
  const [modalAction, setModalAction] = useState("");
  const [modalOnConfirm, setModalOnConfirm] = useState<() => void>(() => () => {});

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const grouped = useMemo(() => {
    const groups: Record<Grade, Prospect[]> = { "A+": [], "A": [], "B": [], "C": [], "D": [] };
    prospects.forEach(p => { if (groups[p.grade]) groups[p.grade].push(p); });
    return groups;
  }, [prospects]);

  const performExecute = async (prospectsToProcess: Prospect[], grade: Grade) => {
    const action = getAutomatedAction(grade);
    if (!action || action === "Store only") { showToast(`No action needed for grade ${grade}`, 'info'); return; }
    const ids = prospectsToProcess.map(p => p.id);
    setExecuting(prev => { const newState = { ...prev }; ids.forEach(id => newState[id] = true); return newState; });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Executed ${action} for ${prospectsToProcess.length} prospect(s) of grade ${grade}`);
      showToast(`✅ ${prospectsToProcess.length} prospect(s) processed (${grade})`, 'success');
    } catch (error) {
      showToast(`❌ Failed to process ${grade} prospects`, 'error');
    } finally {
      setExecuting(prev => { const newState = { ...prev }; ids.forEach(id => delete newState[id]); return newState; });
    }
  };

  const handleExecuteSingle = (prospect: Prospect) => {
    const action = getAutomatedAction(prospect.grade);
    if (!action || action === "Store only") { showToast(`No action needed for ${prospect.company}`, 'info'); return; }
    setModalProspects([prospect]);
    setModalGrade(prospect.grade);
    setModalAction(action);
    setModalOnConfirm(() => () => { performExecute([prospect], prospect.grade); setModalOpen(false); });
    setModalOpen(true);
  };

  const handleRunAll = (grade: Grade) => {
    const prospectsOfGrade = grouped[grade] || [];
    if (prospectsOfGrade.length === 0) return;
    const action = getAutomatedAction(grade);
    if (!action || action === "Store only") { showToast(`No actions for grade ${grade}`, 'info'); return; }
    setModalProspects(prospectsOfGrade);
    setModalGrade(grade);
    setModalAction(action);
    setModalOnConfirm(() => () => { performExecute(prospectsOfGrade, grade); setModalOpen(false); });
    setModalOpen(true);
  };

  const getActionDescription = (grade: Grade): string => {
    switch (grade) {
      case "A+": return "Email + LinkedIn + Call script · CRM record · Notify sales";
      case "A": return "Generate email · Create follow-up task";
      case "B": return "Add to nurture campaign";
      default: return "Store only";
    }
  };

  return (
    <>
      <Card>
        <PanelHead title="Automated Actions" sub="Execute predefined workflows based on prospect grade" />
        {toast && <div className={`mb-4 p-3 rounded-md text-sm ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : toast.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>{toast.message}</div>}
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(["A+", "A", "B", "C", "D"] as Grade[]).map((grade) => {
              const count = grouped[grade]?.length || 0;
              return (
                <div key={grade} className={`p-3 rounded-lg text-center border ${count > 0 ? 'bg-white' : 'bg-neutral-50 opacity-50'}`}>
                  <div className="flex items-center justify-center gap-2"><GradePill grade={grade} /><span className="text-xs text-neutral-500">({count})</span></div>
                  <p className="text-[10px] text-neutral-400 mt-1 truncate">{getActionDescription(grade)}</p>
                </div>
              );
            })}
          </div>

          {(["A+", "A", "B", "C", "D"] as Grade[]).map((grade) => {
            const prospectsOfGrade = grouped[grade] || [];
            if (prospectsOfGrade.length === 0) return null;
            const action = getAutomatedAction(grade);
            const isExecutingSome = prospectsOfGrade.some(p => executing[p.id]);
            return (
              <motion.div key={grade} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="bg-neutral-50 px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200">
                  <div className="flex items-center gap-3"><GradePill grade={grade} /><span className="text-sm font-medium text-neutral-700">{prospectsOfGrade.length} prospect{prospectsOfGrade.length !== 1 ? 's' : ''}</span><span className="text-xs text-neutral-500">Action: {action}</span></div>
                  {action !== "Store only" && (
                    <button onClick={() => handleRunAll(grade)} disabled={isExecutingSome} className={`rounded px-3 py-1 text-xs font-medium transition-all ${isExecutingSome ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' : 'bg-[#1e3a5f] text-white hover:bg-[#16304f] active:scale-95'}`}>
                      {isExecutingSome ? <span className="flex items-center gap-1"><span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> Running...</span> : `Run all ${grade}`}
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white">
                      <tr className="text-left text-xs text-neutral-500 border-b border-neutral-100">
                        <th className="px-4 py-2 font-medium">Company</th><th className="px-4 py-2 font-medium">Industry</th><th className="px-4 py-2 font-medium">Location</th>
                        <th className="px-4 py-2 font-medium text-right">Fit</th><th className="px-4 py-2 font-medium text-right">Intent</th><th className="px-4 py-2 font-medium text-right">Final</th>
                        <th className="px-4 py-2 font-medium text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {prospectsOfGrade.map((p) => (
                        <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-2.5"><p className="font-medium text-neutral-900">{p.company}</p><p className="text-[10px] text-neutral-400">{p.fundingStage}</p></td>
                          <td className="px-4 py-2.5"><IndustryPill industry={p.industry} /></td>
                          <td className="px-4 py-2.5 text-neutral-600">{p.location}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{p.fitScore}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{p.intentScore}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-medium">{p.finalScore}</td>
                          <td className="px-4 py-2.5 text-center">
                            {action !== "Store only" ? (
                              <button onClick={() => handleExecuteSingle(p)} disabled={executing[p.id]} className={`rounded px-3 py-1 text-xs font-medium transition-all ${executing[p.id] ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'}`}>
                                {executing[p.id] ? <span className="flex items-center gap-1"><span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> ...</span> : 'Execute'}
                              </button>
                            ) : <span className="text-xs text-neutral-400">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            );
          })}
          {prospects.length === 0 && <div className="text-center py-12 text-neutral-400"><p>No prospects found. Add some via the Search tab or run a scan.</p></div>}
        </div>
      </Card>
      <ActionPreviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={modalOnConfirm} prospects={modalProspects} grade={modalGrade} action={modalAction} />
    </>
  );
}

/* ---- Page ---- */
export default function ProspectDiscoveryPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [seed, setSeed] = useState(42);
  const [customProspects, setCustomProspects] = useState<Prospect[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);

  const baseProspects = useMemo(() => generateProspects(120, seed), [seed]);
  const allProspects = useMemo(() => {
    const all = [...baseProspects, ...customProspects];
    return all.filter(p => !deletedIds.has(p.id));
  }, [baseProspects, customProspects, deletedIds]);
  const k = useMemo(() => kpis(allProspects), [allProspects]);

  const handleDeleteProspect = useCallback((id: string) => {
    setDeletedIds(prev => new Set(prev).add(id));
  }, []);

  const handleScan = useCallback(() => {
    if (isScanning) return;
    setIsScanning(true);
    setTimeout(() => { setSeed(s => s + 1); setIsScanning(false); }, 1500);
  }, [isScanning]);

  const showGrade = tab === "overview" || tab === "prospects";
  const showQuality = tab === "overview" || tab === "quality";
  const showTable = tab === "overview" || tab === "prospects";
  const showSearch = tab === "search";
  const showAutomation = tab === "automation";

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-900">
      <div className="mx-auto max-w-7xl px-5 pt-28 pb-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h1 className="font-menda-black text-2xl tracking-tight">Prospect Discovery Dashboard</h1>
            <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600">v2.0 · 434 scoring model</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white rounded-lg border border-neutral-200 p-1">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-md px-3 py-1.5 text-[13px] transition-all ${tab === t.id ? "bg-[#1e3a5f] text-white shadow-sm" : "text-neutral-500 hover:bg-neutral-100"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={() => setSeed(s => s + 1)} className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-[13px] text-neutral-500 transition-colors hover:bg-neutral-100" title="Regenerate mock dataset">↻ Reseed</button>
          </div>
        </motion.div>

        <MorningSummary k={k} onScan={handleScan} isScanning={isScanning} />

        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Total prospects" value={allProspects.length.toLocaleString()} delay={0.0} />
          <KpiCard label="A+ prospects" value={k.aPlusCount.toLocaleString()} accent delay={0.05} />
          <KpiCard label="A prospects" value={k.aCount.toLocaleString()} delay={0.1} />
          <KpiCard label="Pipeline value (A+/A)" value={`$${(k.pipelineValue / 1000).toFixed(0)}k`} delay={0.15} />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="B prospects" value={k.bCount.toLocaleString()} delay={0.2} />
          <KpiCard label="Avg final score" value={`${k.avgFinalScore}/100`} delay={0.25} />
          <KpiCard label="A+ conversion rate" value={`${allProspects.length > 0 ? ((k.aPlusCount / allProspects.length) * 100).toFixed(1) : 0}%`} delay={0.3} />
          <KpiCard label="A+/A rate" value={`${allProspects.length > 0 ? (((k.aPlusCount + k.aCount) / allProspects.length) * 100).toFixed(1) : 0}%`} delay={0.35} />
        </div>

        {showSearch && <div className="mb-4"><SearchPanel onAddProspect={(p) => setCustomProspects(prev => [...prev, p])} /></div>}
        {showAutomation && <div className="mb-4"><AutomationPanel prospects={allProspects} /></div>}
        {(showGrade || showQuality) && (
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            {showGrade && <GradePanel prospects={allProspects} />}
            {showQuality && <QualityPanel prospects={allProspects} />}
          </div>
        )}
        {showTable && <TopProspects prospects={allProspects} onDeleteProspect={handleDeleteProspect} />}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center text-xs text-neutral-400 border-t border-neutral-200 pt-4">
          Data sourced from AI-powered web research, Crunchbase, LinkedIn, and public business registries.
          {customProspects.length > 0 && ` · ${customProspects.length} custom prospects added`}
          {deletedIds.size > 0 && ` · ${deletedIds.size} deleted`}
        </motion.div>
      </div>
    </div>
  );
}