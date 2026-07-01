"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  buildSlides,
  type Slide,
  type SlideData,
} from "@/lib/deck-generator/slides";
import type {
  IntakeFormData,
  GeneratedDeckContent,
  GenerateDeckResponse,
} from "@/lib/deck-generator/types";
import type { CMSProject, IntakeData, IntakeSubmission } from "@/lib/cms/types";

/* ================================================================== */
/*  TYPES                                                               */
/* ================================================================== */

type FormState = IntakeData;
type Project = CMSProject;
type IntakeRecord = IntakeSubmission & { name: string; formData: IntakeData };

type View =
  | "landing"
  | "intake-select"
  | "new-intake"
  | "generating"
  | "editor"
  | "preview";

type EmailForm = { clientName: string; clientEmail: string; message: string };

/* ================================================================== */
/*  CONFIG                                                              */
/* ================================================================== */

const objectiveOptions = [
  "Lead Generation", "E-Commerce Sales", "Event Attendance / Tickets",
  "Donations / Fundraising", "Brand Awareness", "Website Traffic", "Other",
];

const channelOptions = [
  "Paid Search", "Paid Social", "SEO / GEO", "Display",
  "Pre-Roll / YouTube", "CTV / OTT", "Email", "Other",
];

const budgetOptions = ["Under $5k", "$5–15k", "$15–50k", "$50k+"];

const requiredFields: (keyof FormState)[] = [
  "companyName", "objective", "whyNow", "geography", "audience", "channels", "budget",
];

const emptyForm: FormState = {
  companyName: "", objective: "", whyNow: "", geography: "", audience: "",
  channels: [], budget: "", competitors: "", usp: "", notes: "",
};

const SLIDE_META: Array<{
  id: string;
  label: string;
  fields: Array<{ key: string; label: string; multiline?: boolean }>;
}> = [
  { id: "title", label: "Title / Cover", fields: [
    { key: "company", label: "Company / Headline" },
    { key: "subtitle", label: "Subtitle / Byline" },
  ]},
  { id: "heard", label: "What We Heard", fields: [
    { key: "challenge", label: "Current Challenges", multiline: true },
    { key: "opportunity", label: "Current Opportunities", multiline: true },
    { key: "outcome", label: "Desired Outcomes", multiline: true },
  ]},
  { id: "opportunity", label: "The Opportunity", fields: [
    { key: "headline", label: "Headline" },
    { key: "bullets", label: "Key Points (one per line)", multiline: true },
  ]},
  { id: "strategy", label: "Strategic Recommendation", fields: [
    { key: "line1", label: "Point 1", multiline: true },
    { key: "line2", label: "Point 2", multiline: true },
    { key: "line3", label: "Point 3", multiline: true },
  ]},
  { id: "plan", label: "Marketing Plan", fields: [
    { key: "channels", label: "Channels" },
    { key: "budget", label: "Budget" },
    { key: "geography", label: "Geography" },
    { key: "audience", label: "Target Audience", multiline: true },
  ]},
  { id: "why", label: "Why This Matters", fields: [
    { key: "point1", label: "Point 1", multiline: true },
    { key: "point2", label: "Point 2", multiline: true },
    { key: "point3", label: "Point 3", multiline: true },
  ]},
  { id: "audience", label: "Audience Prioritization", fields: [
    { key: "primary", label: "Primary Audience", multiline: true },
    { key: "geography", label: "Geography" },
    { key: "notes", label: "Additional Notes", multiline: true },
  ]},
  { id: "flow", label: "Customer Flow Journey", fields: [
    { key: "steps", label: "Journey Steps (one per line)", multiline: true },
  ]},
  { id: "success", label: "Success Stories", fields: [
    { key: "title", label: "Story Title" },
    { key: "challenge", label: "Challenge", multiline: true },
    { key: "solution", label: "Solution", multiline: true },
    { key: "outcome", label: "Outcome", multiline: true },
  ]},
  { id: "metrics", label: "What Success Looks Like", fields: [
    { key: "kpi1", label: "KPI 1" },
    { key: "kpi2", label: "KPI 2" },
    { key: "kpi3", label: "KPI 3" },
    { key: "budget", label: "Budget Range" },
    { key: "channels", label: "Channel Mix" },
  ]},
  { id: "engagement", label: "Recommended Engagement", fields: [
    { key: "strategy", label: "Strategy Services", multiline: true },
    { key: "acquisition", label: "Acquisition Services", multiline: true },
    { key: "optimization", label: "Optimization Services", multiline: true },
  ]},
  { id: "nextsteps", label: "Next Steps", fields: [
    { key: "step1", label: "Step 1" },
    { key: "step2", label: "Step 2" },
    { key: "step3", label: "Step 3" },
    { key: "closing", label: "Closing Statement", multiline: true },
  ]},
];

/* ================================================================== */
/*  API ADAPTERS                                                        */
/* ================================================================== */

function toIntakeRecord(intake: IntakeSubmission): IntakeRecord {
  const { id, createdAt, updatedAt, status, source, leadScore, deckStatus, ...formData } = intake;
  return { ...intake, id, createdAt, updatedAt, status, source, leadScore, deckStatus, name: intake.companyName, formData };
}

/* ================================================================== */
/*  SLIDE HELPERS                                                       */
/* ================================================================== */

function deckContentToSlideData(deck: GeneratedDeckContent): SlideData[] {
  return [
    { id: "title",      image: "", texts: deck.slide1 as unknown as Record<string, string> },
    { id: "heard",      image: "", texts: deck.slide2 as unknown as Record<string, string> },
    { id: "opportunity",image: "", texts: deck.slide3 as unknown as Record<string, string> },
    { id: "strategy",   image: "", texts: deck.slide4 as unknown as Record<string, string> },
    { id: "plan",       image: "", texts: deck.slide5 as unknown as Record<string, string> },
    { id: "why",        image: "", texts: deck.slide6 as unknown as Record<string, string> },
    { id: "audience",   image: "", texts: deck.slide7 as unknown as Record<string, string> },
    { id: "flow",       image: "", texts: deck.slide8 as unknown as Record<string, string> },
    { id: "success",    image: "", texts: deck.slide9 as unknown as Record<string, string> },
    { id: "metrics",    image: "", texts: deck.slide10 as unknown as Record<string, string> },
    { id: "engagement", image: "", texts: deck.slide11 as unknown as Record<string, string> },
    { id: "nextsteps",  image: "", texts: deck.slide12 as unknown as Record<string, string> },
  ];
}

/* ================================================================== */
/*  MANUAL TEMPLATE — hint text per slide                              */
/* ================================================================== */

function buildManualSlideData(): SlideData[] {
  return [
    { id: "title", image: "", texts: {
      company: "Your Company Name",
      subtitle: "Presented By : 434 Media",
    }},
    { id: "heard", image: "", texts: {
      challenge: "Heavy reliance on paid search\nLimited awareness outside existing demand channels\nNeed for scalable customer acquisition",
      opportunity: "Growing consumer demand in your market\nStrong operations and expertise — a solid foundation\nAbility to scale rapidly into additional markets",
      outcome: "Increase booked conversions — drive revenue\nReduce customer acquisition cost — improve efficiency\nBuild sustainable brand awareness — become the go-to\nCreate repeatable growth systems — scale with confidence",
    }},
    { id: "opportunity", image: "", texts: {
      headline: "Primary Objective — The moment is now.",
      bullets: "• Why is the market opportunity real and timely?\n• What trend or shift supports acting now?\n• Why is the competition vulnerable?\n• Why is 434 Media the right partner?",
    }},
    { id: "strategy", image: "", texts: {
      line1: "Acquire consumers actively seeking answers.",
      line2: "Building trust through education on relevant content.",
      line3: "Curate repeat customers through ongoing engagement in order to retain established trust.",
    }},
    { id: "plan", image: "", texts: {
      channels: "Paid Search, Paid Social, Display",
      budget: "TBD",
      geography: "Target Market",
      audience: "Describe your core target audience here",
    }},
    { id: "why", image: "", texts: {
      point1: "Their unique differentiator or USP that gives them a competitive edge",
      point2: "Why the timing is right — the urgency or market moment driving action",
      point3: "Why their audience is ready, reachable, and primed to convert",
    }},
    { id: "audience", image: "", texts: {
      primary: "Young Adults (18–34) — largest volume opportunity",
      geography: "Target geography and market reach",
      notes: "Additional targeting notes, seasonality, or special considerations",
    }},
    { id: "flow", image: "", texts: {
      steps: "Awareness\nSearch Intent\nWebsite Visit\nLead Form\nConsultation\nCustomer\nReferral",
    }},
    { id: "success", image: "", texts: {
      title: "Success Story: Client Name — Objective Achieved",
      challenge: "Describe the challenge the client faced before working with 434 Media",
      solution: "Describe the media strategy and channels deployed to solve it",
      outcome: "Describe the measurable results — leads, ROAS, impressions, conversions",
    }},
    { id: "metrics", image: "", texts: {
      kpi1: "Primary KPI — e.g. Cost Per Lead",
      kpi2: "Secondary KPI — e.g. Return on Ad Spend",
      kpi3: "Awareness KPI — e.g. Brand Search Lift",
      budget: "Budget range",
      channels: "Your channel mix",
    }},
    { id: "engagement", image: "", texts: {
      strategy: "• Brand Strategy & Positioning\n• Campaign Planning & Architecture\n• Audience Research\n• Competitive Analysis",
      acquisition: "• Paid Search\n• Paid Social\n• Display / Pre-Roll\n• CTV / OTT",
      optimization: "• A/B Testing & Creative Optimization\n• Conversion Rate Optimization\n• Real-Time Reporting\n• Budget Pacing",
    }},
    { id: "nextsteps", image: "", texts: {
      step1: "Kick-off call to align on goals, timeline, and creative direction",
      step2: "Full media plan and strategy brief delivered within 5 business days",
      step3: "Campaign launch with live reporting dashboard and weekly check-ins",
      closing: "Let's build a media strategy that drives real results for your business.",
    }},
  ];
}

/* ================================================================== */
/*  STYLE CONSTANTS                                                     */
/* ================================================================== */

const baseField =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3.5 text-neutral-900 " +
  "placeholder-neutral-400 transition-colors outline-none " +
  "focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

/* ================================================================== */
/*  IMAGE PICKER — CMS accordion image panel with AI Studio            */
/* ================================================================== */

function buildImagePrompt(slideId: string, texts: Record<string, string>): string {
  const bw = "black and white photography, high contrast monochrome, editorial style, dramatic lighting, no color";
  const clean = (s: string) => (s || "").replace(/^[•\-–—]\s*/gm, "").replace(/\n.*/g, "").trim().slice(0, 80);
  switch (slideId) {
    case "title": return `Bold cinematic backdrop for ${clean(texts.company) || "a brand"}, ${clean(texts.subtitle) || "business proposal"} — ${bw}`;
    case "heard": return `Abstract editorial visual representing business challenge and market opportunity — ${bw}`;
    case "opportunity": return `Dynamic market opportunity — ${clean(texts.headline) || "business growth"} — ${bw}`;
    case "strategy": return `Strategic growth and planning, strong geometric composition — ${bw}`;
    case "plan": return `${clean(texts.geography) || "Urban market"} — aerial or street photography, media and advertising environment — ${bw}`;
    case "why": return `${clean(texts.point1) || "Confident business"} — bold editorial portrait or abstract power visual — ${bw}`;
    case "audience": return `${clean(texts.primary) || "Diverse consumer audience"} in ${clean(texts.geography) || "a city"}, candid lifestyle photography — ${bw}`;
    case "flow": return `Customer journey and movement — people in motion, urban flow — ${bw}`;
    case "success": return `Victory and achievement — ${clean(texts.title) || "success story"} — celebratory energy, strong composition — ${bw}`;
    case "metrics": return `Data and performance concept, abstract patterns, technology backdrop — ${bw}`;
    case "engagement": return `Marketing agency environment, creative collaboration, team at work — ${bw}`;
    case "nextsteps": return `Forward motion and momentum — open road, path, or horizon — ${bw}`;
    default: return `Professional business editorial photography — ${bw}`;
  }
}

function ImagePicker({
  onChange, slideId, slideTexts,
}: {
  onChange: (url: string) => void; slideId?: string; slideTexts?: Record<string, string>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_W = 1280, MAX_H = 720;
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_W) { height = Math.round((height * MAX_W) / width); width = MAX_W; }
      if (height > MAX_H) { width = Math.round((width * MAX_H) / height); height = MAX_H; }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      onChange(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); const reader = new FileReader(); reader.onload = (ev) => { if (ev.target?.result) onChange(ev.target.result as string); }; reader.readAsDataURL(file); };
    img.src = url;
    e.target.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true); setAiError("");
    try {
      const res = await fetch("/api/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      onChange(data.imageUrl); setAiOpen(false); setPrompt("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Generation failed");
    } finally { setGenerating(false); }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => ref.current?.click()} className="flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors">↑ Upload</button>
        <button type="button" onClick={() => { const opening = !aiOpen; setAiOpen(opening); setAiError(""); if (opening && slideId && slideTexts && !prompt.trim()) setPrompt(buildImagePrompt(slideId, slideTexts)); }} className={`flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg font-medium transition-colors ${aiOpen ? "bg-neutral-900 text-white" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"}`}>✦ AI Studio</button>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <AnimatePresence>
        {aiOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="space-y-2 pt-1">
              <textarea rows={2} className={baseField + " text-sm"} placeholder="Describe the image…" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }} />
              {aiError && <p className="text-xs text-red-500 px-1">{aiError}</p>}
              <button type="button" onClick={handleGenerate} disabled={generating || !prompt.trim()} className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium disabled:opacity-40 hover:bg-neutral-700 transition-colors">{generating ? "Generating…" : "Generate Image"}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  STATUS BADGE                                                        */
/* ================================================================== */

function StatusBadge({ status }: { status: Project["status"] }) {
  const cls: Record<Project["status"], string> = {
    draft: "bg-neutral-100 text-neutral-600",
    ready: "bg-emerald-100 text-emerald-700",
    exported: "bg-blue-100 text-blue-700",
  };
  return <span className={`text-[10px] font-geist-mono uppercase tracking-widest px-2 py-0.5 rounded-full ${cls[status]}`}>{status}</span>;
}

/* ================================================================== */
/*  DECK VIEWER                                                         */
/* ================================================================== */

function DeckViewer({
  slides, currentSlideIndex, setCurrentSlideIndex,
  updateSlideText, updateSlideImage,
  onBack, onEnhance, isEnhancing, label, onDownload, isDownloading,
}: {
  slides: Slide[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (i: number) => void;
  updateSlideText: (idx: number, key: string, val: string) => void;
  updateSlideImage: (idx: number, val: string) => void;
  onBack: () => void;
  onEnhance: () => void;
  isEnhancing: boolean;
  label?: string;
  onDownload: () => void;
  isDownloading: boolean;
}) {
  const paginate = useCallback(
    (d: number) => {
      const n = currentSlideIndex + d;
      if (n >= 0 && n < slides.length) setCurrentSlideIndex(n);
    },
    [currentSlideIndex, slides.length, setCurrentSlideIndex]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); paginate(1); }
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [paginate]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-neutral-950 font-geist-sans text-white">
      {label && (
        <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-neutral-900 border-b border-neutral-800">
          <span className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400">{label}</span>
          <button onClick={onBack} className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-1.5 text-sm font-medium transition-colors">← Back</button>
        </div>
      )}
      <div className="flex flex-1 items-center justify-center bg-neutral-900 md:bg-transparent md:p-4">
        <div className="@container relative h-full w-full overflow-hidden bg-white shadow-2xl md:aspect-video md:h-auto md:max-w-[min(100vw,calc((100vh-6rem)*16/9))] md:max-h-[calc(100vh-6rem)] md:rounded-lg md:ring-1 md:ring-white/10">
          <AnimatePresence initial={false} mode="wait">
            {slides.length > 0 && (
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
                className="absolute inset-0 overflow-y-auto overflow-x-hidden md:overflow-hidden"
              >
                {slides[currentSlideIndex].node({
                  slide: slides[currentSlideIndex],
                  updateText: (k, v) => updateSlideText(currentSlideIndex, k, v),
                  updateImage: (v) => updateSlideImage(currentSlideIndex, v),
                })}
              </motion.div>
            )}
          </AnimatePresence>
          <button aria-label="Previous slide" onClick={() => paginate(-1)} disabled={currentSlideIndex === 0} className="absolute inset-y-0 left-0 w-[12%] cursor-w-resize disabled:cursor-default hidden md:block" />
          <button aria-label="Next slide" onClick={() => paginate(1)} disabled={currentSlideIndex === slides.length - 1} className="absolute inset-y-0 right-0 w-[12%] cursor-e-resize disabled:cursor-default hidden md:block" />
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="shrink-0 bg-neutral-950 border-t border-neutral-800 overflow-x-auto">
        <div className="flex gap-2 px-4 py-2.5" style={{ minWidth: "max-content" }}>
          {slides.map((slide, i) => {
            const meta = SLIDE_META.find((m) => m.id === slide.id);
            const isActive = i === currentSlideIndex;
            return (
              <button key={i} onClick={() => setCurrentSlideIndex(i)} aria-label={`Go to slide ${i + 1}`}
                className={`relative flex-shrink-0 w-24 rounded-lg overflow-hidden transition-all duration-200 ${isActive ? "ring-2 ring-white scale-105 opacity-100" : "ring-1 ring-neutral-700 opacity-50 hover:opacity-80 hover:ring-neutral-400"}`}
                style={{ aspectRatio: "16/9" }}>
                {slide.image
                  ? <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover grayscale" /> // eslint-disable-line @next/next/no-img-element
                  : <div className="absolute inset-0 bg-neutral-800" />}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-0.5 p-1">
                  <span className="font-geist-mono text-[8px] text-white/50 leading-none">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-white text-[7px] font-medium text-center leading-tight line-clamp-2 w-full px-0.5">{meta?.label ?? slide.id}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-neutral-800 bg-neutral-950 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-xs text-neutral-400 hover:text-white transition-colors">← Back</button>
          <span className="font-geist-mono text-xs text-neutral-400">
            <span className="font-bold text-white">{String(currentSlideIndex + 1).padStart(2, "0")}</span> / {String(slides.length).padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => paginate(-1)} disabled={currentSlideIndex === 0} className="rounded-full border border-neutral-700 px-3 py-1.5 text-sm transition-colors hover:bg-white hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white">←</button>
          <div className="hidden items-center gap-1.5 sm:flex">
            {slides.map((_, i) => <button key={i} aria-label={`Go to slide ${i + 1}`} onClick={() => setCurrentSlideIndex(i)} className={`h-1.5 rounded-full transition-all ${i === currentSlideIndex ? "w-6 bg-white" : "w-1.5 bg-neutral-600 hover:bg-neutral-400"}`} />)}
          </div>
          <button onClick={() => paginate(1)} disabled={currentSlideIndex === slides.length - 1} className="rounded-full border border-neutral-700 px-3 py-1.5 text-sm transition-colors hover:bg-white hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white">→</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onDownload} disabled={isDownloading} className="rounded-full border border-neutral-700 bg-transparent text-white px-4 py-1.5 text-sm font-medium hover:bg-white hover:text-neutral-900 transition-colors disabled:cursor-not-allowed disabled:opacity-50">{isDownloading ? "Generating…" : "↓ Download PDF"}</button>
          <button onClick={onEnhance} disabled={isEnhancing} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${isEnhancing ? "bg-neutral-700 text-neutral-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"}`}>
            {isEnhancing ? <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Enhancing…</span> : "✨ AI Enhance"}
          </button>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 hidden sm:block">434 Media</p>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================== */
/*  SLIDE ACCORDION EDITOR                                              */
/* ================================================================== */

function SlideMiniPreview({
  data,
  label,
  onPositionChange,
  onRemoveImage,
}: {
  data: SlideData;
  label: string;
  onPositionChange: (position: { x: number; y: number }) => void;
  onRemoveImage: () => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; position: { x: number; y: number } } | null>(null);
  const [scale, setScale] = useState(0);
  const slide = useMemo(
    () => buildSlides([data]).find((candidate) => candidate.id === data.id),
    [data]
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const updateScale = () => setScale(frame.clientWidth / 1600);
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  if (!slide) return null;
  const position = data.imagePosition ?? { x: 50, y: 50 };

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!data.image) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, position };
  };

  const moveImage = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!drag || !frame || drag.pointerId !== event.pointerId) return;
    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    onPositionChange({
      x: clamp(drag.position.x - ((event.clientX - drag.x) / frame.clientWidth) * 100),
      y: clamp(drag.position.y - ((event.clientY - drag.y) / frame.clientHeight) * 100),
    });
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
        Slide Preview
      </span>
      <div
        ref={frameRef}
        role="img"
        aria-label={`Preview of ${label}`}
        className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
      >
        {scale > 0 && (
          <div
            className="@container pointer-events-none absolute left-0 top-0 h-[900px] w-[1600px] select-none overflow-hidden"
            style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
          >
            {slide.node({ slide, updateText: () => {}, updateImage: () => {} })}
          </div>
        )}
        {data.image && (
          <>
            <div
              className="absolute inset-0 z-20 cursor-move touch-none"
              onPointerDown={beginDrag}
              onPointerMove={moveImage}
              onPointerUp={() => { dragRef.current = null; }}
              onPointerCancel={() => { dragRef.current = null; }}
              aria-label="Drag to reposition slide image"
            />
            <button type="button" onClick={onRemoveImage} className="absolute right-2 top-2 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white transition-colors hover:bg-red-600" aria-label="Remove image">×</button>
          </>
        )}
      </div>
      {data.image && (
        <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-neutral-400">
          <span className="font-geist-mono uppercase tracking-wider">Drag preview to reposition image</span>
          <button type="button" onClick={() => onPositionChange({ x: 50, y: 50 })} className="shrink-0 hover:text-neutral-900">Reset center</button>
        </div>
      )}
    </div>
  );
}

function SlideAccordion({
  slideData, onChange, onImageChange, onImagePositionChange, onRegenerateSlide, isRegenerating,
}: {
  slideData: SlideData[];
  onChange: (data: SlideData[]) => void;
  onImageChange: (slideId: string, image: string) => void;
  onImagePositionChange: (slideId: string, position: { x: number; y: number }) => void;
  onRegenerateSlide?: (slideId: string) => void;
  isRegenerating?: string | null;
}) {
  const [openId, setOpenId] = useState<string | null>(SLIDE_META[0]?.id ?? null);

  const updateField = (id: string, key: string, val: string) =>
    onChange(slideData.map((s) => s.id === id ? { ...s, texts: { ...s.texts, [key]: val } } : s));
  return (
    <div className="space-y-2">
      {SLIDE_META.map((meta, idx) => {
        const data = slideData.find((s) => s.id === meta.id) ?? { id: meta.id, texts: {}, image: "" };
        const isOpen = openId === meta.id;
        const filled = meta.fields.filter((f) => (data.texts[f.key] ?? "").trim().length > 0).length;
        const regen = isRegenerating === meta.id;

        return (
          <div key={meta.id} className="rounded-2xl border border-neutral-200 overflow-hidden bg-white">
            <button type="button" className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-neutral-50 transition-colors" onClick={() => setOpenId(isOpen ? null : meta.id)}>
              <span className="font-geist-mono text-xs text-neutral-400 w-6 shrink-0">{String(idx + 1).padStart(2, "0")}</span>
              <span className="flex-1 font-medium text-neutral-900">Slide {idx + 1} — {meta.label}</span>
              <span className={`text-[10px] font-geist-mono px-2 py-0.5 rounded-full ${filled === meta.fields.length ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>{filled}/{meta.fields.length}</span>
              {onRegenerateSlide && (
                <button type="button" onClick={(e) => { e.stopPropagation(); onRegenerateSlide(meta.id); }} disabled={!!isRegenerating} className="shrink-0 text-xs px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-colors disabled:opacity-40" title="Regenerate this slide">
                  {regen ? <span className="flex items-center gap-1"><span className="animate-spin h-3 w-3 border-2 border-neutral-400 border-t-neutral-900 rounded-full inline-block" /></span> : "↺"}
                </button>
              )}
              <span className="text-neutral-400 text-xl font-light leading-none w-4 text-center">{isOpen ? "−" : "+"}</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                  <div className="border-t border-neutral-100 px-5 py-5 space-y-4">
                    {meta.fields.map((f) => (
                      <label key={f.key} className="block">
                        <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">{f.label}</span>
                        {f.multiline
                          ? <textarea rows={3} className={baseField} value={data.texts[f.key] ?? ""} onChange={(e) => updateField(meta.id, f.key, e.target.value)} placeholder={`Enter ${f.label.toLowerCase()}…`} />
                          : <input type="text" className={baseField} value={data.texts[f.key] ?? ""} onChange={(e) => updateField(meta.id, f.key, e.target.value)} placeholder={`Enter ${f.label.toLowerCase()}…`} />
                        }
                      </label>
                    ))}
                    <SlideMiniPreview data={data} label={`Slide ${idx + 1} — ${meta.label}`} onPositionChange={(position) => onImagePositionChange(meta.id, position)} onRemoveImage={() => onImageChange(meta.id, "")} />
                    <ImagePicker onChange={(v) => onImageChange(meta.id, v)} slideId={meta.id} slideTexts={data.texts} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  INTAKE MINI-FORM                                                    */
/* ================================================================== */

function IntakeForm({ onSubmit, onCancel, initialData = emptyForm }: { onSubmit: (form: FormState) => void; onCancel: () => void; initialData?: FormState }) {
  const [form, setForm] = useState<FormState>(initialData);
  const [errors, setErrors] = useState<Set<keyof FormState>>(new Set());
  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => { setForm((f) => ({ ...f, [k]: v })); setErrors((prev) => { const n = new Set(prev); n.delete(k); return n; }); };
  const toggleChannel = (c: string) => update("channels", form.channels.includes(c) ? form.channels.filter((x) => x !== c) : [...form.channels, c]);
  const err = (k: keyof FormState) => errors.has(k);
  const fc = (k: keyof FormState) => baseField + (err(k) ? " border-red-500" : "");
  const handleSubmit = () => {
    const missing = requiredFields.filter((k) => { const v = form[k]; return Array.isArray(v) ? v.length === 0 : !v.trim(); });
    if (missing.length) { setErrors(new Set(missing)); return; }
    onSubmit(form);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 p-6">
        <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-5">00 — Client Info</p>
        <label className="block">
          <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Client / Company Name{err("companyName") && <span className="text-red-500 ml-1">*</span>}</span>
          <input type="text" className={fc("companyName")} placeholder="e.g. TXMX Boxing…" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
        </label>
      </div>
      <div className="rounded-2xl border border-neutral-200 p-6">
        <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-5">01 — The Opportunity</p>
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Primary Objective{err("objective") && <span className="text-red-500 ml-1">*</span>}</span>
            <div className="flex flex-wrap gap-2">{objectiveOptions.map((o) => <button key={o} type="button" onClick={() => update("objective", o)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${form.objective === o ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:border-neutral-900"}`}>{o}</button>)}</div>
          </label>
          <label className="block"><span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Why Now?{err("whyNow") && <span className="text-red-500 ml-1">*</span>}</span><textarea rows={3} className={fc("whyNow")} placeholder="What's driving the timing?" value={form.whyNow} onChange={(e) => update("whyNow", e.target.value)} /></label>
          <label className="block"><span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Target Geography{err("geography") && <span className="text-red-500 ml-1">*</span>}</span><input className={fc("geography")} placeholder="San Antonio, South Texas…" value={form.geography} onChange={(e) => update("geography", e.target.value)} /></label>
          <label className="block"><span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Target Audience{err("audience") && <span className="text-red-500 ml-1">*</span>}</span><textarea rows={3} className={fc("audience")} placeholder="Who are we trying to reach?" value={form.audience} onChange={(e) => update("audience", e.target.value)} /></label>
        </div>
      </div>
      <div className="rounded-2xl border border-neutral-200 p-6">
        <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-5">02 — Media Plan Inputs</p>
        <div className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Channels{err("channels") && <span className="text-red-500 ml-1">*</span>}</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{channelOptions.map((c) => <button key={c} type="button" onClick={() => toggleChannel(c)} className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${form.channels.includes(c) ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:border-neutral-900"}`}>{c}</button>)}</div>
          </label>
          <label className="block">
            <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Budget{err("budget") && <span className="text-red-500 ml-1">*</span>}</span>
            <div className="flex flex-wrap gap-2">{budgetOptions.map((b) => <button key={b} type="button" onClick={() => update("budget", b)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${form.budget === b ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:border-neutral-900"}`}>{b}</button>)}</div>
          </label>
        </div>
      </div>
      <div className="rounded-2xl border border-neutral-200 p-6">
        <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-5">03 — Sharpen the Pitch <span className="normal-case">(optional)</span></p>
        <div className="space-y-5">
          <label className="block"><span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Competitors</span><textarea rows={3} className={baseField} placeholder="Who else is in the conversation?" value={form.competitors} onChange={(e) => update("competitors", e.target.value)} /></label>
          <label className="block"><span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Unique Selling Proposition</span><textarea rows={3} className={baseField} placeholder="What makes them different?" value={form.usp} onChange={(e) => update("usp", e.target.value)} /></label>
          <label className="block"><span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Notes</span><textarea rows={3} className={baseField} placeholder="Anything else worth capturing" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></label>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 pt-2">
        <button type="button" onClick={onCancel} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">← Cancel</button>
        <AnimatePresence>{errors.size > 0 && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-geist-mono text-xs text-red-600">{errors.size} required field{errors.size > 1 ? "s" : ""} missing</motion.span>}</AnimatePresence>
        <button type="button" onClick={handleSubmit} className="rounded-xl bg-neutral-900 px-8 py-3.5 font-medium text-white hover:bg-neutral-800 transition-colors">Save Profile →</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MAIN CMS PAGE                                                       */
/* ================================================================== */

export default function CMSPage() {
  const [view, setView] = useState<View>("landing");
  const [projects, setProjects] = useState<Project[]>([]);
  const [intakes, setIntakes] = useState<IntakeRecord[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [slideData, setSlideData] = useState<SlideData[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [pdfProjectId, setPdfProjectId] = useState<string | null>(null);
  const [emailProject, setEmailProject] = useState<Project | null>(null);
  const [emailForm, setEmailForm] = useState<EmailForm>({ clientName: "", clientEmail: "", message: "" });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [generationMessage, setGenerationMessage] = useState("");
  const [isRegeneratingSlide, setIsRegeneratingSlide] = useState<string | null>(null);
  const [useIntakeData, setUseIntakeData] = useState(true);
  const [intakeSearch, setIntakeSearch] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState("");
  const [selectedIntake, setSelectedIntake] = useState<IntakeRecord | null>(null);
  const [editingIntake, setEditingIntake] = useState<IntakeRecord | null>(null);
  const previewSlides = useMemo(() => buildSlides(slideData), [slideData]);

  useEffect(() => {
    Promise.all([fetch("/api/projects"), fetch("/api/intakes")])
      .then(async ([projectResponse, intakeResponse]) => {
        const projectResult = await projectResponse.json();
        const intakeResult = await intakeResponse.json();
        if (!projectResponse.ok) throw new Error(projectResult.error || "Unable to load projects.");
        if (!intakeResponse.ok) throw new Error(intakeResult.error || "Unable to load intake submissions.");
        setProjects(projectResult.projects);
        setIntakes((intakeResult.intakes as IntakeSubmission[]).map(toIntakeRecord));
      })
      .catch((error) => setDataError(error instanceof Error ? error.message : "Unable to load CMS data."))
      .finally(() => setIsLoadingData(false));
  }, []);

  useEffect(() => {
    if (!activeProject || slideData.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const updated: Project = { ...activeProject, slideData, updatedAt: new Date().toISOString() };
      fetch(`/api/projects/${updated.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slideData: updated.slideData }) })
        .catch(() => setFeedback({ kind: "error", message: "Autosave failed." }));
      setActiveProject(updated);
      setProjects((current) => current.map((project) => project.id === updated.id ? updated : project));
      setLastSaved(new Date());
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [slideData]); // eslint-disable-line react-hooks/exhaustive-deps

  const openEditor = (project: Project) => {
    setActiveProject(project);
    setSlideData(project.slideData);
    setLastSaved(null);
    setView("editor");
  };

  const createProject = async (name: string, sourceMode: Project["sourceMode"], data: SlideData[], intakeId?: string) => {
    const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, status: "draft", sourceMode, intakeId, slideData: data }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to create project.");
    const project = result.project as Project;
    setProjects((current) => [project, ...current]);
    if (intakeId) {
      await fetch(`/api/intakes/${intakeId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deckStatus: "generated", status: "qualified" }) });
      setIntakes((current) => current.map((intake) => intake.id === intakeId ? { ...intake, deckStatus: "generated", status: "qualified" } : intake));
    }
    openEditor(project);
  };

  const generateDeckFromIntake = useCallback(async (intake: IntakeRecord) => {
    setGenerationStatus("generating");
    setGenerationMessage("Analyzing client profile…");
    setView("generating");
    const intakeData: IntakeFormData = intake.formData;
    try {
      setGenerationMessage("Generating personalized slide content…");
      const res = await fetch("/api/generate-deck", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intake: intakeData }) });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const { deck, source, warning } = await res.json() as GenerateDeckResponse;
      if (warning) console.warn("[CMS] Deck generation warning:", warning);
      setGenerationMessage(source === "ai" ? "Finalizing AI-generated content…" : "Building deck from template…");
      await new Promise((r) => setTimeout(r, 600));
      const data = deckContentToSlideData(deck);
      setGenerationStatus("done");
      await createProject(intake.name || intake.objective || "New Deck", "intake", data, intake.id);
    } catch (err) {
      console.error("[CMS] Generation failed:", err);
      setGenerationStatus("error");
      setGenerationMessage(err instanceof Error ? err.message : "Generation failed. Please try again.");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const regenerateSlide = useCallback(async (slideId: string) => {
    if (!activeProject?.intakeId || isRegeneratingSlide) return;
    const intake = intakes.find((i) => i.id === activeProject.intakeId);
    if (!intake) return;
    setIsRegeneratingSlide(slideId);
    try {
      const res = await fetch("/api/generate-deck", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intake: intake.formData }) });
      if (!res.ok) throw new Error("Regeneration failed");
      const { deck } = await res.json() as GenerateDeckResponse;
      const allData = deckContentToSlideData(deck);
      const freshSlide = allData.find((s) => s.id === slideId);
      if (freshSlide) setSlideData((prev) => prev.map((s) => s.id === slideId ? { ...freshSlide, image: s.image } : s));
    } catch (err) { console.error("[CMS] Slide regeneration failed:", err); }
    finally { setIsRegeneratingSlide(null); }
  }, [activeProject, intakes, isRegeneratingSlide]);

  const regenerateFullDeck = useCallback(async () => {
    if (!activeProject?.intakeId) return;
    const intake = intakes.find((i) => i.id === activeProject.intakeId);
    if (!intake) return;
    if (!confirm("Regenerate all slides from this client profile? Your current edits will be replaced.")) return;
    const images = slideData.reduce<Record<string, string>>((acc, s) => { acc[s.id] = s.image; return acc; }, {});
    setGenerationStatus("generating");
    setGenerationMessage("Regenerating all slides…");
    setView("generating");
    try {
      const res = await fetch("/api/generate-deck", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intake: intake.formData }) });
      if (!res.ok) throw new Error("Regeneration failed");
      const { deck } = await res.json() as GenerateDeckResponse;
      const fresh = deckContentToSlideData(deck).map((s) => ({ ...s, image: images[s.id] ?? "" }));
      setSlideData(fresh);
      setGenerationStatus("done");
      setView("editor");
    } catch (err) { setGenerationStatus("error"); setGenerationMessage(err instanceof Error ? err.message : "Regeneration failed"); }
  }, [activeProject, intakes, slideData]);

  const handleManualBuild = () => {
    const data = buildManualSlideData();
    createProject(`Manual Deck — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, "manual", data);
  };

  const handleSelectIntake = (intake: IntakeRecord) => {
    if (!useIntakeData) {
      createProject(intake.name || intake.objective || "New Deck", "intake", buildManualSlideData(), intake.id);
    } else {
      generateDeckFromIntake(intake);
    }
  };

  const handleNewIntake = async (form: FormState) => {
    try {
      if (editingIntake) {
        await updateIntake(editingIntake, { data: form });
        setEditingIntake(null);
        setView("intake-select");
        setFeedback({ kind: "success", message: "Intake updated." });
        return;
      }
      const response = await fetch("/api/intakes", { method: "POST", headers: { "Content-Type": "application/json", "x-intake-source": "cms" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save intake.");
      const record = toIntakeRecord(result.intake as IntakeSubmission);
      setIntakes((current) => [record, ...current]);
      if (useIntakeData) await generateDeckFromIntake(record);
      else await createProject(record.name, "intake", buildManualSlideData(), record.id);
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Unable to save intake." });
    }
  };

  const handlePreview = () => {
    setPreviewIdx(0);
    setView("preview");
  };

  const handleSlideImageChange = useCallback((slideId: string, image: string) => {
    const updatedSlideData = slideData.map((slide) => slide.id === slideId
      ? { ...slide, image, imagePosition: { x: 50, y: 50 } }
      : slide);
    setSlideData(updatedSlideData);
    if (activeProject) {
      const updatedProject: Project = {
        ...activeProject,
        slideData: updatedSlideData,
        updatedAt: new Date().toISOString(),
      };
      fetch(`/api/projects/${updatedProject.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slideData: updatedProject.slideData }) })
        .catch(() => setFeedback({ kind: "error", message: "Image save failed." }));
      setActiveProject(updatedProject);
      setProjects((current) => current.map((project) => project.id === updatedProject.id ? updatedProject : project));
      setLastSaved(new Date());
    }
  }, [activeProject, slideData]);

  const handleSlideImagePositionChange = useCallback((slideId: string, position: { x: number; y: number }) => {
    setSlideData((current) => current.map((slide) => slide.id === slideId
      ? { ...slide, imagePosition: position }
      : slide));
  }, []);

  const downloadPdf = useCallback(async (project: Project) => {
    if (pdfProjectId) return;
    setPdfProjectId(project.id); setFeedback(null);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, projectName: project.name, slideData: project.slideData }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "PDF generation failed.");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || "Pitch_Deck.pdf";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = filename; anchor.click();
      URL.revokeObjectURL(url);
      setFeedback({ kind: "success", message: `${filename} downloaded.` });
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "PDF generation failed." });
    } finally { setPdfProjectId(null); }
  }, [pdfProjectId]);

  const handleGeneratePDF = () => {
    if (activeProject) downloadPdf({ ...activeProject, slideData });
  };

  const handleSendEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!emailProject || isSendingEmail) return;
    setIsSendingEmail(true); setFeedback(null);
    try {
      const response = await fetch("/api/email-pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: emailProject.id, projectName: emailProject.name, slideData: emailProject.slideData, ...emailForm }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Email delivery failed.");
      setEmailProject(null);
      setEmailForm({ clientName: "", clientEmail: "", message: "" });
      setFeedback({ kind: "success", message: `PDF emailed to ${emailForm.clientEmail}.` });
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Email delivery failed." });
    } finally { setIsSendingEmail(false); }
  };

  const handleUpdatePreviewText = (idx: number, key: string, val: string) => {
    const slideId = previewSlides[idx]?.id;
    if (slideId) setSlideData((prev) => prev.map((s) => s.id === slideId ? { ...s, texts: { ...s.texts, [key]: val } } : s));
  };

  const handleUpdatePreviewImage = (idx: number, val: string) => {
    const slideId = previewSlides[idx]?.id;
    if (slideId) handleSlideImageChange(slideId, val);
  };

  const runAIEnhancement = useCallback(async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsEnhancing(false);
  }, [isEnhancing]);

  const handleDeleteProject = async (id: string) => {
    const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (response.ok) setProjects((current) => current.filter((project) => project.id !== id));
    else setFeedback({ kind: "error", message: "Unable to delete project." });
  };
  const handleMarkReady = async (id: string) => {
    const response = await fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "ready" }) });
    if (response.ok) setProjects((current) => current.map((project) => project.id === id ? { ...project, status: "ready", updatedAt: new Date().toISOString() } : project));
    else setFeedback({ kind: "error", message: "Unable to update project." });
  };

  const updateIntake = async (intake: IntakeRecord, changes: { data?: IntakeData; status?: IntakeSubmission["status"]; deckStatus?: IntakeSubmission["deckStatus"] }) => {
    const response = await fetch(`/api/intakes/${intake.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to update intake.");
    const next = toIntakeRecord({ ...intake, ...(changes.data ?? {}), status: changes.status ?? intake.status, deckStatus: changes.deckStatus ?? intake.deckStatus, updatedAt: new Date().toISOString() });
    setIntakes((current) => current.map((item) => item.id === intake.id ? next : item));
    setSelectedIntake(next);
  };

  const deleteIntake = async (intake: IntakeRecord) => {
    const response = await fetch(`/api/intakes/${intake.id}`, { method: "DELETE" });
    if (response.ok) { setIntakes((current) => current.filter((item) => item.id !== intake.id)); setSelectedIntake(null); }
    else setFeedback({ kind: "error", message: "Unable to delete intake." });
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  if (view === "preview") {
    return (
      <DeckViewer label="Deck Preview" slides={previewSlides} currentSlideIndex={previewIdx} setCurrentSlideIndex={setPreviewIdx}
        updateSlideText={handleUpdatePreviewText} updateSlideImage={handleUpdatePreviewImage}
        onBack={() => setView("editor")} onEnhance={runAIEnhancement} isEnhancing={isEnhancing}
        onDownload={handleGeneratePDF} isDownloading={pdfProjectId === activeProject?.id} />
    );
  }

  if (view === "generating") {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral-950 text-white">
        <div className="w-full max-w-sm text-center px-6">
          <p className="font-geist-mono text-xs uppercase tracking-[0.3em] text-neutral-500 mb-4">434 Media</p>
          <h2 className="font-ggx88 text-4xl mb-8">Generating Deck</h2>
          {generationStatus === "error" ? (
            <>
              <div className="rounded-2xl bg-red-900/30 border border-red-700 p-6 mb-6 text-left"><p className="text-sm text-red-300">{generationMessage || "Generation failed."}</p></div>
              <button onClick={() => { setGenerationStatus("idle"); setView("intake-select"); }} className="w-full rounded-xl bg-white text-neutral-900 py-3 font-medium hover:bg-neutral-100 transition-colors">← Try Again</button>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="h-1 w-full rounded-full bg-neutral-800 overflow-hidden mb-4">
                  <motion.div className="h-full rounded-full bg-white" initial={{ width: "5%" }} animate={{ width: generationStatus === "done" ? "100%" : "75%" }} transition={{ duration: generationStatus === "done" ? 0.4 : 8, ease: "easeOut" }} />
                </div>
                <p className="text-sm text-neutral-400">{generationMessage}</p>
              </div>
              <div className="space-y-3 text-left">
                {["Analyzing client profile", "Building 12-slide structure", "Generating personalized content", "Finalizing and saving"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${generationStatus === "done" ? "bg-emerald-500 text-white" : i === 0 ? "bg-white text-neutral-900" : "bg-neutral-800 text-neutral-500"}`}>
                      {generationStatus === "done" ? "✓" : i === 0 ? <span className="animate-spin h-3 w-3 border-2 border-neutral-400 border-t-neutral-900 rounded-full inline-block" /> : String(i + 1)}
                    </span>
                    <span className={`text-sm ${i === 0 ? "text-white" : "text-neutral-600"}`}>{step}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setGenerationStatus("idle"); setView("intake-select"); }} className="mt-8 text-xs text-neutral-600 hover:text-neutral-400 transition-colors">Cancel</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="font-geist-mono text-xs uppercase tracking-[0.3em] text-neutral-400">434 Media</p>
          <h1 className="font-ggx88 text-4xl md:text-5xl mt-1">Content Management System</h1>
        </div>
        {isLoadingData && <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500">Loading projects and intake submissions…</div>}
        {dataError && <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{dataError}</div>}

        {/* ── LANDING ── */}
        {view === "landing" && (
          <>
            <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">New Deck</p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setView("intake-select")} className="rounded-2xl border-2 border-neutral-200 bg-white p-8 text-left hover:border-neutral-900 hover:shadow-lg transition-all group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">📋</div>
                <h3 className="font-semibold text-xl mb-2">From Client Profile</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">Select a saved client profile. AI generates personalized content for all 12 slides from their intake data.</p>
                <p className="mt-5 text-xs font-geist-mono text-neutral-400 group-hover:text-neutral-700 transition-colors">Browse profiles & generate →</p>
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleManualBuild} className="rounded-2xl border-2 border-neutral-200 bg-white p-8 text-left hover:border-neutral-900 hover:shadow-lg transition-all group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">📄</div>
                <h3 className="font-semibold text-xl mb-2">Manual Build</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">Open a bare-bones template with guidance in each slide. Fill it yourself from scratch.</p>
                <p className="mt-5 text-xs font-geist-mono text-neutral-400 group-hover:text-neutral-700 transition-colors">Open blank template →</p>
              </motion.button>
            </div>
            {projects.length > 0 && (
              <>
                <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">Recent Projects</p>
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        {["Name", "Source", "Status", "Updated", ""].map((h) => (
                          <th key={h} className={`text-left px-5 py-3 font-geist-mono text-[10px] uppercase tracking-widest text-neutral-400 ${h === "Source" ? "hidden sm:table-cell" : ""} ${h === "Updated" ? "hidden md:table-cell" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {projects.slice(0, 8).map((p) => (
                        <tr key={p.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => openEditor(p)}>
                          <td className="px-5 py-3.5 font-medium text-neutral-900">{p.name}</td>
                          <td className="px-5 py-3.5 text-neutral-500 hidden sm:table-cell"><span className="font-geist-mono text-[10px] uppercase tracking-widest">{p.sourceMode === "intake" ? "AI / Intake" : "Manual"}</span></td>
                          <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                          <td className="px-5 py-3.5 text-neutral-400 text-xs hidden md:table-cell">{new Date(p.updatedAt).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                              <button onClick={(e) => { e.stopPropagation(); setEmailProject(p); setEmailForm({ clientName: p.name, clientEmail: "", message: "" }); }} className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors">Email PDF</button>
                              <button onClick={(e) => { e.stopPropagation(); downloadPdf(p); }} disabled={pdfProjectId !== null} className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors disabled:cursor-not-allowed disabled:opacity-40">{pdfProjectId === p.id ? "Generating…" : "Download PDF"}</button>
                              {p.status === "draft" && <button onClick={(e) => { e.stopPropagation(); handleMarkReady(p.id); }} className="text-xs px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors">Mark Ready</button>}
                              <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${p.name}"?`)) handleDeleteProject(p.id); }} className="text-neutral-400 hover:text-red-600 transition-colors" aria-label="Delete">✕</button>
                              <button onClick={(e) => { e.stopPropagation(); openEditor(p); }} className="text-xs font-medium text-neutral-900">Edit →</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {/* ── INTAKE SELECT ── */}
        {view === "intake-select" && (
          <>
            <button onClick={() => setView("landing")} className="mb-6 text-sm text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1.5">← Back</button>
            <h2 className="font-ggx88 text-3xl mb-2">Client Profiles</h2>
            <p className="text-neutral-500 text-sm mb-6">Select a profile to generate a personalized deck.</p>
            <div className="flex items-center gap-4 mb-6 px-5 py-4 bg-white border-2 border-neutral-200 rounded-2xl">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900">Populate slides with client data</p>
                <p className="text-xs text-neutral-500 mt-0.5">{useIntakeData ? "AI will generate all 12 slides from the client's intake responses." : "Opens a blank template — you fill each slide manually."}</p>
              </div>
              <button type="button" onClick={() => setUseIntakeData((v) => !v)} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${useIntakeData ? "bg-neutral-900" : "bg-neutral-300"}`} aria-checked={useIntakeData} role="switch">
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${useIntakeData ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="flex gap-3 mb-5">
              <input type="text" placeholder="Search by company, objective, or location…" value={intakeSearch} onChange={(e) => setIntakeSearch(e.target.value)} className="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 bg-white" />
              <button onClick={() => { setEditingIntake(null); setView("new-intake"); }} className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm text-white hover:bg-neutral-800 transition-colors shrink-0">+ New Profile</button>
            </div>
            {(() => {
              const q = intakeSearch.toLowerCase();
              const filtered = intakes.filter((i) => i.name.toLowerCase().includes(q) || i.objective.toLowerCase().includes(q) || (i.geography ?? "").toLowerCase().includes(q));
              return filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
                  <p className="text-neutral-400 text-sm mb-4">{intakes.length === 0 ? "No client profiles saved yet." : "No results match your search."}</p>
                  <button onClick={() => setView("new-intake")} className="rounded-xl bg-neutral-900 px-6 py-2.5 text-sm text-white hover:bg-neutral-800 transition-colors">Create First Profile</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((intake) => (
                    <motion.div key={intake.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-center gap-4 group hover:border-neutral-400 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-900 truncate">{intake.name}</h3>
                        <p className="text-sm text-neutral-500 mt-0.5">{intake.formData.objective}{intake.geography ? ` · ${intake.geography}` : ""}</p>
                        <p className="text-xs text-neutral-400 font-geist-mono mt-1">{new Date(intake.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setSelectedIntake(intake)} className="text-sm px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:border-neutral-900">View</button>
                        <button onClick={() => { setEditingIntake(intake); setView("new-intake"); }} className="text-sm px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:border-neutral-900">Edit</button>
                        {intake.status !== "ready" && <button onClick={() => updateIntake(intake, { status: "ready", deckStatus: "ready_to_generate" }).catch((error) => setFeedback({ kind: "error", message: error.message }))} className="text-sm px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50">Mark Ready</button>}
                        <button onClick={() => handleSelectIntake(intake)} className={`text-sm px-5 py-2.5 rounded-xl font-medium transition-colors ${useIntakeData ? "bg-neutral-900 text-white hover:bg-neutral-800" : "border border-neutral-300 text-neutral-700 hover:border-neutral-900"}`}>
                          {useIntakeData ? "✦ Generate →" : "Open Template →"}
                        </button>
                        <button onClick={() => { if (confirm(`Delete "${intake.name}"?`)) deleteIntake(intake); }} className="text-xs px-3 py-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">✕</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
            {selectedIntake && (
              <div className="mt-6 rounded-2xl border border-neutral-300 bg-white p-6">
                <div className="flex items-start justify-between gap-4"><div><p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-400">Full Intake Response</p><h3 className="mt-1 text-xl font-semibold">{selectedIntake.companyName}</h3></div><button onClick={() => setSelectedIntake(null)} aria-label="Close">×</button></div>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
                  {(["objective", "whyNow", "geography", "audience", "budget", "competitors", "usp", "notes"] as const).map((key) => <div key={key}><dt className="font-geist-mono text-[10px] uppercase tracking-wider text-neutral-400">{key}</dt><dd className="mt-1 whitespace-pre-wrap text-neutral-700">{selectedIntake[key] || "—"}</dd></div>)}
                  <div><dt className="font-geist-mono text-[10px] uppercase tracking-wider text-neutral-400">Channels</dt><dd className="mt-1 text-neutral-700">{selectedIntake.channels.join(", ")}</dd></div>
                  <div><dt className="font-geist-mono text-[10px] uppercase tracking-wider text-neutral-400">Status</dt><dd className="mt-1 text-neutral-700">{selectedIntake.status} · {selectedIntake.deckStatus} · score {selectedIntake.leadScore}</dd></div>
                </dl>
              </div>
            )}
          </>
        )}

        {/* ── NEW INTAKE ── */}
        {view === "new-intake" && (
          <>
            <button onClick={() => { setEditingIntake(null); setView("intake-select"); }} className="mb-6 text-sm text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1.5">← Back to Client Profiles</button>
            <p className="font-geist-mono text-xs uppercase tracking-[0.25em] text-neutral-400">{editingIntake ? "Edit Profile" : "New Profile"}</p>
            <h2 className="font-ggx88 text-4xl mt-2 mb-8">Discovery Intake</h2>
            <IntakeForm key={editingIntake?.id ?? "new"} initialData={editingIntake?.formData} onSubmit={handleNewIntake} onCancel={() => { setEditingIntake(null); setView("intake-select"); }} />
          </>
        )}

        {/* ── EDITOR ── */}
        {view === "editor" && activeProject && (() => {
          const filledCount = slideData.filter((s) => SLIDE_META.find((m) => m.id === s.id)?.fields.some((f) => (s.texts[f.key] ?? "").trim())).length;
          const total = SLIDE_META.length;
          const pct = Math.round((filledCount / total) * 100);
          return (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setView("landing")} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">← Back</button>
                  <span className="text-neutral-300">·</span>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium text-neutral-900 truncate">{activeProject.name}</span>
                    <StatusBadge status={activeProject.status} />
                    {lastSaved && <span className="font-geist-mono text-[10px] text-neutral-400 hidden sm:inline">· Saved {lastSaved.toLocaleTimeString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="font-geist-mono text-[10px] text-neutral-400 flex-1">{filledCount}/{total} slides filled · {pct}% complete</span>
                  {activeProject.sourceMode === "intake" && activeProject.intakeId && (
                    <button onClick={regenerateFullDeck} className="text-xs px-3 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors">↺ Regenerate All</button>
                  )}
                  <button onClick={handlePreview} className="text-xs px-4 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 transition-colors">Preview →</button>
                  <button onClick={handleGeneratePDF} className="text-xs px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">↓ Generate PDF</button>
                </div>
                <div className="h-1 w-full rounded-full bg-neutral-200 overflow-hidden">
                  <div className="h-full rounded-full bg-neutral-900 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="bg-white border border-neutral-100 rounded-xl px-4 py-3 mb-5 text-sm text-neutral-500">
                {activeProject.sourceMode === "intake"
                  ? <>AI has pre-filled all slides from client data. Expand any slide to review and edit. Changes autosave automatically.</>
                  : <>Each slide has guidance text showing what to include. Click any field to edit. Changes autosave automatically.</>
                }
              </div>
              <SlideAccordion slideData={slideData} onChange={setSlideData} onImageChange={handleSlideImageChange} onImagePositionChange={handleSlideImagePositionChange}
                onRegenerateSlide={activeProject.sourceMode === "intake" && activeProject.intakeId ? regenerateSlide : undefined}
                isRegenerating={isRegeneratingSlide} />
            </>
          );
        })()}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className={`fixed bottom-6 right-6 z-[10001] max-w-sm rounded-xl px-4 py-3 text-sm text-white shadow-xl ${feedback.kind === "success" ? "bg-emerald-700" : "bg-red-700"}`} role="status">
            <div className="flex items-center gap-4"><span>{feedback.message}</span><button onClick={() => setFeedback(null)} aria-label="Dismiss">×</button></div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {emailProject && (
          <motion.div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget && !isSendingEmail) setEmailProject(null); }}>
            <motion.form onSubmit={handleSendEmail} initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div><p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Email PDF</p><h2 className="mt-1 text-xl font-semibold text-neutral-900">{emailProject.name}</h2></div>
                <button type="button" onClick={() => setEmailProject(null)} disabled={isSendingEmail} className="text-xl text-neutral-400 hover:text-neutral-900 disabled:opacity-40" aria-label="Close">×</button>
              </div>
              <div className="space-y-4">
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-neutral-600">Client Name</span><input required value={emailForm.clientName} onChange={(e) => setEmailForm((form) => ({ ...form, clientName: e.target.value }))} className={baseField} /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-neutral-600">Client Email</span><input required type="email" value={emailForm.clientEmail} onChange={(e) => setEmailForm((form) => ({ ...form, clientEmail: e.target.value }))} className={baseField} /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-neutral-600">Message <span className="font-normal text-neutral-400">(optional)</span></span><textarea rows={4} value={emailForm.message} onChange={(e) => setEmailForm((form) => ({ ...form, message: e.target.value }))} className={baseField} /></label>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setEmailProject(null)} disabled={isSendingEmail} className="rounded-xl px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-40">Cancel</button>
                <button type="submit" disabled={isSendingEmail} className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50">{isSendingEmail ? "Generating & sending…" : "Send PDF"}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
