"use client";

import { useState, useRef, type ReactNode, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ================================================================== */
/*  TYPES                                                               */
/* ================================================================== */

type FormState = {
  objective: string;
  whyNow: string;
  geography: string;
  audience: string;
  channels: string[];
  budget: string;
  competitors: string;
  usp: string;
  notes: string;
};

type SlideData = {
  id: string;
  texts: Record<string, string>;
  image: string;
};

type Slide = {
  id: string;
  node: (props: {
    slide: Slide;
    updateText: (key: string, val: string) => void;
    updateImage: (val: string) => void;
  }) => ReactNode;
  texts: Record<string, string>;
  image: string;
};

type Project = {
  id: string;
  name: string;
  status: "draft" | "ready" | "exported";
  sourceMode: "intake" | "manual";
  intakeId?: string;
  slideData: SlideData[];
  createdAt: string;
  updatedAt: string;
};

type IntakeRecord = {
  id: string;
  name: string;
  objective: string;
  geography: string;
  formData: FormState;
  createdAt: string;
};

type View = "dashboard" | "projects" | "intakes" | "new-intake" | "editor" | "preview" | "template";

/* ================================================================== */
/*  CONFIG                                                              */
/* ================================================================== */

const objectiveOptions = [
  "Lead Generation",
  "E-Commerce Sales",
  "Event Attendance / Tickets",
  "Donations / Fundraising",
  "Brand Awareness",
  "Website Traffic",
  "Other",
];

const channelOptions = [
  "Paid Search",
  "Paid Social",
  "SEO / GEO",
  "Display",
  "Pre-Roll / YouTube",
  "CTV / OTT",
  "Email",
  "Other",
];

const budgetOptions = ["Under $5k", "$5–15k", "$15–50k", "$50k+"];

const requiredFields: (keyof FormState)[] = [
  "objective",
  "whyNow",
  "geography",
  "audience",
  "channels",
  "budget",
];

const emptyForm: FormState = {
  objective: "",
  whyNow: "",
  geography: "",
  audience: "",
  channels: [],
  budget: "",
  competitors: "",
  usp: "",
  notes: "",
};

const SLIDE_META: Array<{
  id: string;
  label: string;
  fields: Array<{ key: string; label: string; multiline?: boolean }>;
}> = [
  {
    id: "title",
    label: "Title / Cover",
    fields: [
      { key: "company", label: "Company / Headline" },
      { key: "subtitle", label: "Subtitle" },
      { key: "tagline", label: "Tagline" },
    ],
  },
  {
    id: "heard",
    label: "What We Heard",
    fields: [
      { key: "challenge", label: "The Challenge", multiline: true },
      { key: "opportunity", label: "The Opportunity", multiline: true },
      { key: "outcome", label: "The Outcome", multiline: true },
    ],
  },
  {
    id: "opportunity",
    label: "The Opportunity",
    fields: [
      { key: "headline", label: "Headline" },
      { key: "bullets", label: "Key Points (one per line)", multiline: true },
    ],
  },
  {
    id: "strategy",
    label: "Strategy",
    fields: [
      { key: "line1", label: "Strategy Point 1", multiline: true },
      { key: "line2", label: "Strategy Point 2", multiline: true },
      { key: "line3", label: "Strategy Point 3", multiline: true },
    ],
  },
  {
    id: "plan",
    label: "Media Plan",
    fields: [
      { key: "channels", label: "Channels" },
      { key: "budget", label: "Budget" },
      { key: "geography", label: "Geography" },
      { key: "audience", label: "Target Audience", multiline: true },
    ],
  },
  {
    id: "why",
    label: "Why This Works",
    fields: [
      { key: "point1", label: "Key Point 1", multiline: true },
      { key: "point2", label: "Key Point 2", multiline: true },
      { key: "point3", label: "Key Point 3", multiline: true },
    ],
  },
  {
    id: "audience",
    label: "Target Audience",
    fields: [
      { key: "primary", label: "Primary Audience", multiline: true },
      { key: "geography", label: "Geography" },
      { key: "notes", label: "Notes", multiline: true },
    ],
  },
  {
    id: "flow",
    label: "Customer Flow Journey",
    fields: [
      { key: "steps", label: "Journey Steps (one per line)", multiline: true },
    ],
  },
  {
    id: "success",
    label: "Success Story",
    fields: [
      { key: "title", label: "Story Title" },
      { key: "challenge", label: "Challenge", multiline: true },
      { key: "solution", label: "Solution", multiline: true },
      { key: "outcome", label: "Outcome", multiline: true },
    ],
  },
  {
    id: "metrics",
    label: "Success Metrics",
    fields: [
      { key: "kpi1", label: "KPI 1" },
      { key: "kpi2", label: "KPI 2" },
      { key: "kpi3", label: "KPI 3" },
      { key: "budget", label: "Budget Range" },
      { key: "channels", label: "Channel Mix" },
    ],
  },
  {
    id: "engagement",
    label: "Recommended Engagement",
    fields: [
      { key: "strategy", label: "Strategy Services", multiline: true },
      { key: "acquisition", label: "Acquisition Services", multiline: true },
      { key: "optimization", label: "Optimization Services", multiline: true },
    ],
  },
  {
    id: "nextsteps",
    label: "Next Steps",
    fields: [
      { key: "step1", label: "Step 1" },
      { key: "step2", label: "Step 2" },
      { key: "step3", label: "Step 3" },
      { key: "closing", label: "Closing Statement", multiline: true },
    ],
  },
];

/* ================================================================== */
/*  STORAGE                                                             */
/* ================================================================== */

function readLS<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLS<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* Projects */
function getProjects(): Project[] {
  return readLS<Project>("cms_projects");
}
function persistProject(p: Project) {
  const all = getProjects();
  const idx = all.findIndex((x) => x.id === p.id);
  if (idx >= 0) all[idx] = p;
  else all.unshift(p);
  writeLS("cms_projects", all);
}
function removeProject(id: string) {
  writeLS("cms_projects", getProjects().filter((p) => p.id !== id));
}
function cloneProject(id: string): boolean {
  const original = getProjects().find((p) => p.id === id);
  if (!original) return false;
  const copy: Project = {
    ...original,
    id: uid(),
    name: `${original.name} (Copy)`,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slideData: original.slideData.map((s) => ({ ...s, texts: { ...s.texts } })),
  };
  writeLS("cms_projects", [copy, ...getProjects()]);
  return true;
}

/* Intakes */
function getIntakes(): IntakeRecord[] {
  const fresh = readLS<IntakeRecord>("cms_intakes");
  if (fresh.length) return fresh;
  // Migrate from old key used by deck-generator
  return readLS<{ id: string; name: string; formData: FormState; createdAt: string }>(
    "intakeSubmissions"
  ).map((o) => ({
    id: o.id,
    name: o.name,
    objective: o.formData.objective,
    geography: o.formData.geography,
    formData: o.formData,
    createdAt: o.createdAt,
  }));
}
function persistIntake(r: IntakeRecord) {
  const all = getIntakes();
  const idx = all.findIndex((x) => x.id === r.id);
  if (idx >= 0) all[idx] = r;
  else all.unshift(r);
  writeLS("cms_intakes", all);
  // Keep old key in sync so deck-generator still sees the data
  writeLS(
    "intakeSubmissions",
    all.map((i) => ({ id: i.id, name: i.name, formData: i.formData, createdAt: i.createdAt }))
  );
}
function removeIntake(id: string) {
  const updated = getIntakes().filter((i) => i.id !== id);
  writeLS("cms_intakes", updated);
  writeLS(
    "intakeSubmissions",
    updated.map((i) => ({ id: i.id, name: i.name, formData: i.formData, createdAt: i.createdAt }))
  );
}

const MOCK_INTAKES: IntakeRecord[] = [
  {
    id: "mock-txmx",
    name: "TXMX Boxing — Championship Event",
    objective: "Drive ticket sales and stream subscriptions for the upcoming championship",
    geography: "San Antonio, TX",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    formData: {
      objective: "Drive ticket sales and stream subscriptions for the TXMX championship event",
      whyNow: "Championship in 6 weeks — ticket sales are lagging behind projections",
      geography: "San Antonio, TX — with digital reach across DFW and Houston",
      audience: "Hispanic sports fans 18–45, boxing enthusiasts, local fight community",
      channels: ["Social Media", "Digital Video", "OOH"],
      budget: "$25,000–$50,000",
      competitors: "ESPN+ boxing events, local fight promotion companies",
      usp: "Authentic Latino boxing culture, hometown heroes, family-friendly atmosphere",
      notes: "Event date March 15. Bilingual creative required — English and Spanish.",
    },
  },
  {
    id: "mock-vemos",
    name: "Vemos Vamos — South Texas Tourism",
    objective: "Grow cultural tourism in South Texas and attract national visitors",
    geography: "South Texas",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    formData: {
      objective: "Grow cultural tourism footprint in South Texas and attract national visitors",
      whyNow: "Spring break season is the highest travel demand window of the year",
      geography: "South Texas — targeting travelers from Austin, Houston, and DFW",
      audience: "Cultural travelers 25–55, heritage tourism seekers, families with disposable income",
      channels: ["Social Media", "Influencer / Creator", "Search"],
      budget: "$10,000–$25,000",
      competitors: "Visit San Antonio, Texas Tourism Board campaigns",
      usp: "Authentic under-the-radar destinations, community-led storytelling, local immersion",
      notes: "Partner with local artists and restaurants for content. Spanish-language assets needed.",
    },
  },
  {
    id: "mock-canvas",
    name: "Digital Canvas — B2B SaaS Launch",
    objective: "Generate qualified leads for our new creative collaboration platform",
    geography: "National",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    formData: {
      objective: "Generate qualified leads and demo sign-ups for Digital Canvas v2.0 launch",
      whyNow: "Product launch window is Q2 — competitors are spending heavily right now",
      geography: "US National — targeting agencies in the top 10 markets",
      audience: "Creative directors and marketing managers at agencies with 10–200 employees",
      channels: ["Social Media", "Email / CRM", "Search"],
      budget: "$50,000–$100,000",
      competitors: "Figma, Canva for Teams, Adobe Creative Cloud for Teams",
      usp: "AI-powered creative briefs, real-time collaboration, built specifically for agencies",
      notes: "Emphasize ROI and time savings. Beta user case studies available as social proof.",
    },
  },
];

/* Template */
function getTemplateData(): SlideData[] | null {
  try {
    const raw = localStorage.getItem("cms_template") ?? localStorage.getItem("deckTemplate");
    return raw ? (JSON.parse(raw) as SlideData[]) : null;
  } catch {
    return null;
  }
}
function persistTemplate(data: SlideData[]) {
  localStorage.setItem("cms_template", JSON.stringify(data));
  localStorage.setItem("deckTemplate", JSON.stringify(data)); // backward compat
}

/* ================================================================== */
/*  SLIDE HELPERS                                                       */
/* ================================================================== */

function slidesToData(slides: Slide[]): SlideData[] {
  return slides.map((s) => ({ id: s.id, texts: { ...s.texts }, image: s.image }));
}

function dataToSlides(data: SlideData[]): Slide[] {
  const base = buildSlides(emptyForm);
  return base.map((slide) => {
    const found = data.find((d) => d.id === slide.id);
    if (!found) return slide;
    return { ...slide, texts: { ...slide.texts, ...found.texts }, image: found.image || slide.image };
  });
}

function applyTemplate(data: SlideData[]): SlideData[] {
  const tpl = getTemplateData();
  if (!tpl) return data;
  return data.map((d) => {
    const t = tpl.find((x) => x.id === d.id);
    if (!t) return d;
    // Template fills only empty fields; user data takes priority
    const merged: Record<string, string> = { ...t.texts };
    Object.entries(d.texts).forEach(([k, v]) => {
      if (v) merged[k] = v;
    });
    return { ...d, texts: merged, image: d.image || t.image };
  });
}

/* ================================================================== */
/*  STYLE CONSTANTS                                                     */
/* ================================================================== */

const baseField =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3.5 text-neutral-900 " +
  "placeholder-neutral-400 transition-colors outline-none " +
  "focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

const HEAD = "font-ggx88 font-black uppercase tracking-tighter leading-[0.85] text-neutral-900";

/* ================================================================== */
/*  PRIMITIVE COMPONENTS                                                */
/* ================================================================== */

function EditableText({
  value,
  onChange,
  className = "",
  as: Tag = "p",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3" | "span";
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setEditing(false);
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setEditing(false);
    }
  };

  if (editing) {
    const cls =
      "w-full bg-transparent border-b border-neutral-900 outline-none resize-none text-inherit font-inherit";
    if (Tag === "h1" || Tag === "h2" || Tag === "h3") {
      return (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={onKey}
          className={`${cls} ${className}`}
        />
      );
    }
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={onKey}
        rows={3}
        className={`${cls} ${className}`}
      />
    );
  }

  return (
    <Tag
      onClick={() => setEditing(true)}
      className={`cursor-text hover:bg-neutral-100/40 rounded px-1 transition-colors ${className}`}
    >
      {value || <span className="text-neutral-400 italic text-sm">Click to edit…</span>}
    </Tag>
  );
}

function compressImage(file: File, callback: (url: string) => void) {
  const MAX_W = 1280;
  const MAX_H = 720;
  const img = new window.Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    let { width, height } = img;
    if (width > MAX_W) { height = Math.round((height * MAX_W) / width); width = MAX_W; }
    if (height > MAX_H) { width = Math.round((width * MAX_H) / height); height = MAX_H; }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);
    callback(canvas.toDataURL("image/jpeg", 0.82));
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target?.result) callback(ev.target.result as string); };
    reader.readAsDataURL(file);
  };
  img.src = url;
}

function ImagePicker({
  src,
  onChange,
}: {
  src?: string;
  onChange: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, onChange);
    e.target.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setAiError("");
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      onChange(data.imageUrl);
      setAiOpen(false);
      setPrompt("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Preview */}
      <div className="relative h-28 rounded-xl overflow-hidden bg-neutral-100">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "repeating-linear-gradient(135deg,#d4d4d4 0 14px,#c8c8c8 14px 28px)" }}
          >
            <span className="text-neutral-500 text-xs font-medium">No image set</span>
          </div>
        )}
        {src && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm leading-none hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            ×
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
        >
          ↑ Upload from device
        </button>
        <button
          type="button"
          onClick={() => { setAiOpen(!aiOpen); setAiError(""); }}
          className={`flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg font-medium transition-colors ${
            aiOpen
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
          }`}
        >
          ✦ AI Studio
        </button>
      </div>

      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onFile} />

      {/* AI generation panel */}
      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-1">
              <textarea
                rows={2}
                className={baseField + " text-sm"}
                placeholder="Describe the background image you want… e.g. 'bold aerial view of a city at night, dark tones'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
              />
              {aiError && <p className="text-xs text-red-500 px-1">{aiError}</p>}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium disabled:opacity-40 hover:bg-neutral-700 transition-colors"
              >
                {generating ? "Generating…" : "Generate Image"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Waveform({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end gap-[2px] ${className}`}>
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-current opacity-30"
          style={{ height: `${20 + Math.abs(Math.sin(i * 0.6) * 60 + Math.cos(i * 0.3) * 20)}%` }}
        />
      ))}
    </div>
  );
}

/* ================================================================== */
/*  DECK VIEWER                                                         */
/* ================================================================== */

function DeckViewer({
  slides,
  currentSlideIndex,
  setCurrentSlideIndex,
  updateSlideText,
  updateSlideImage,
  onBack,
  onEnhance,
  isEnhancing,
  extraActions,
  label,
}: {
  slides: Slide[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (i: number) => void;
  updateSlideText: (idx: number, key: string, val: string) => void;
  updateSlideImage: (idx: number, val: string) => void;
  onBack: () => void;
  onEnhance: () => void;
  isEnhancing: boolean;
  extraActions?: ReactNode;
  label?: string;
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
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        paginate(1);
      }
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [paginate]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-neutral-950 text-white">
      {label && (
        <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-neutral-900 border-b border-neutral-800">
          <span className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400">{label}</span>
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-1.5 text-sm font-medium transition-colors"
          >
            ✕ Close &amp; Exit
          </button>
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
                transition={{ duration: 0.35 }}
                className="absolute inset-0 overflow-y-auto overflow-x-hidden"
              >
                {slides[currentSlideIndex].node({
                  slide: slides[currentSlideIndex],
                  updateText: (k, v) => updateSlideText(currentSlideIndex, k, v),
                  updateImage: (v) => updateSlideImage(currentSlideIndex, v),
                })}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            aria-label="Previous slide"
            onClick={() => paginate(-1)}
            disabled={currentSlideIndex === 0}
            className="absolute inset-y-0 left-0 w-[12%] cursor-w-resize disabled:cursor-default hidden md:block"
          />
          <button
            aria-label="Next slide"
            onClick={() => paginate(1)}
            disabled={currentSlideIndex === slides.length - 1}
            className="absolute inset-y-0 right-0 w-[12%] cursor-e-resize disabled:cursor-default hidden md:block"
          />
        </div>
      </div>

      {/* ── Thumbnail strip ── */}
      <div className="shrink-0 bg-neutral-950 border-t border-neutral-800 overflow-x-auto">
        <div className="flex gap-2 px-4 py-2.5" style={{ minWidth: "max-content" }}>
          {slides.map((slide, i) => {
            const meta = SLIDE_META.find((m) => m.id === slide.id);
            const isActive = i === currentSlideIndex;
            return (
              <button
                key={i}
                onClick={() => setCurrentSlideIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`relative flex-shrink-0 w-24 rounded-lg overflow-hidden transition-all duration-200 ${
                  isActive
                    ? "ring-2 ring-white scale-105 opacity-100"
                    : "ring-1 ring-neutral-700 opacity-50 hover:opacity-80 hover:ring-neutral-400"
                }`}
                style={{ aspectRatio: "16/9" }}
              >
                {slide.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-neutral-800" />
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-0.5 p-1">
                  <span className="font-geist-mono text-[8px] text-white/50 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-white text-[7px] font-medium text-center leading-tight line-clamp-2 w-full px-0.5">
                    {meta?.label ?? slide.id}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-neutral-800 bg-neutral-950 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <span className="font-geist-mono text-xs text-neutral-400">
            <span className="font-bold text-white">
              {String(currentSlideIndex + 1).padStart(2, "0")}
            </span>{" "}
            / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => paginate(-1)}
            disabled={currentSlideIndex === 0}
            className="rounded-full border border-neutral-700 px-3 py-1.5 text-sm transition-colors hover:bg-white hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            ←
          </button>
          <div className="hidden items-center gap-1.5 sm:flex">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrentSlideIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentSlideIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-neutral-600 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => paginate(1)}
            disabled={currentSlideIndex === slides.length - 1}
            className="rounded-full border border-neutral-700 px-3 py-1.5 text-sm transition-colors hover:bg-white hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-3">
          {extraActions}
          <button
            onClick={onEnhance}
            disabled={isEnhancing}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isEnhancing
                ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
            }`}
          >
            {isEnhancing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                Enhancing…
              </span>
            ) : (
              "✨ AI Enhance"
            )}
          </button>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 hidden sm:block">
            434 Media
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================== */
/*  SLIDE ACCORDION EDITOR                                              */
/* ================================================================== */

function SlideAccordion({
  slideData,
  onChange,
}: {
  slideData: SlideData[];
  onChange: (data: SlideData[]) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(SLIDE_META[0]?.id ?? null);

  const updateField = (id: string, key: string, val: string) => {
    onChange(
      slideData.map((s) =>
        s.id === id ? { ...s, texts: { ...s.texts, [key]: val } } : s
      )
    );
  };

  const updateImg = (id: string, val: string) => {
    onChange(slideData.map((s) => (s.id === id ? { ...s, image: val } : s)));
  };

  return (
    <div className="space-y-2">
      {SLIDE_META.map((meta, idx) => {
        const data = slideData.find((s) => s.id === meta.id) ?? {
          id: meta.id,
          texts: {},
          image: "",
        };
        const isOpen = openId === meta.id;
        const filled = meta.fields.filter((f) => (data.texts[f.key] ?? "").trim().length > 0).length;

        return (
          <div key={meta.id} className="rounded-2xl border border-neutral-200 overflow-hidden bg-white">
            <button
              type="button"
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
              onClick={() => setOpenId(isOpen ? null : meta.id)}
            >
              <span className="font-geist-mono text-xs text-neutral-400 w-6 shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 font-medium text-neutral-900">
                Slide {idx + 1} — {meta.label}
              </span>
              <span
                className={`text-[10px] font-geist-mono px-2 py-0.5 rounded-full ${
                  filled === meta.fields.length
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {filled}/{meta.fields.length}
              </span>
              <span className="text-neutral-400 text-xl font-light leading-none w-4 text-center">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-neutral-100 px-5 py-5 space-y-4">
                    {meta.fields.map((f) => (
                      <label key={f.key} className="block">
                        <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                          {f.label}
                        </span>
                        {f.multiline ? (
                          <textarea
                            rows={3}
                            className={baseField}
                            value={data.texts[f.key] ?? ""}
                            onChange={(e) => updateField(meta.id, f.key, e.target.value)}
                            placeholder={`Enter ${f.label.toLowerCase()}…`}
                          />
                        ) : (
                          <input
                            type="text"
                            className={baseField}
                            value={data.texts[f.key] ?? ""}
                            onChange={(e) => updateField(meta.id, f.key, e.target.value)}
                            placeholder={`Enter ${f.label.toLowerCase()}…`}
                          />
                        )}
                      </label>
                    ))}
                    <label className="block">
                      <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                        Slide Background Image
                      </span>
                      <ImagePicker
                        src={data.image}
                        onChange={(v: string) => updateImg(meta.id, v)}
                      />
                    </label>
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
/*  STATUS BADGE                                                        */
/* ================================================================== */

function StatusBadge({ status }: { status: Project["status"] }) {
  const cls: Record<Project["status"], string> = {
    draft: "bg-neutral-100 text-neutral-600",
    ready: "bg-emerald-100 text-emerald-700",
    exported: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`text-[10px] font-geist-mono uppercase tracking-widest px-2 py-0.5 rounded-full ${cls[status]}`}
    >
      {status}
    </span>
  );
}

/* ================================================================== */
/*  INTAKE MINI-FORM                                                    */
/* ================================================================== */

function IntakeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Set<keyof FormState>>(new Set());

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((prev) => {
      const n = new Set(prev);
      n.delete(k);
      return n;
    });
  };

  const toggleChannel = (c: string) => {
    update(
      "channels",
      form.channels.includes(c) ? form.channels.filter((x) => x !== c) : [...form.channels, c]
    );
  };

  const err = (k: keyof FormState) => errors.has(k);
  const fc = (k: keyof FormState) => baseField + (err(k) ? " border-red-500" : "");

  const handleSubmit = () => {
    const missing = requiredFields.filter((k) => {
      const v = form[k];
      return Array.isArray(v) ? v.length === 0 : !v.trim();
    });
    if (missing.length) {
      setErrors(new Set(missing));
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-6">
      {/* 01 — The Opportunity */}
      <div className="rounded-2xl border border-neutral-200 p-6">
        <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-5">
          01 — The Opportunity
        </p>
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Primary Objective{err("objective") && <span className="text-red-500 ml-1">*</span>}
            </span>
            <div className="flex flex-wrap gap-2">
              {objectiveOptions.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => update("objective", o)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    form.objective === o
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-neutral-900"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Why Now?{err("whyNow") && <span className="text-red-500 ml-1">*</span>}
            </span>
            <textarea
              rows={3}
              className={fc("whyNow")}
              placeholder="What's driving the timing?"
              value={form.whyNow}
              onChange={(e) => update("whyNow", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Target Geography{err("geography") && <span className="text-red-500 ml-1">*</span>}
            </span>
            <input
              className={fc("geography")}
              placeholder="San Antonio, South Texas…"
              value={form.geography}
              onChange={(e) => update("geography", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Target Audience{err("audience") && <span className="text-red-500 ml-1">*</span>}
            </span>
            <textarea
              rows={3}
              className={fc("audience")}
              placeholder="Who are we trying to reach?"
              value={form.audience}
              onChange={(e) => update("audience", e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* 02 — Media Plan */}
      <div className="rounded-2xl border border-neutral-200 p-6">
        <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-5">
          02 — Media Plan Inputs
        </p>
        <div className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Channels{err("channels") && <span className="text-red-500 ml-1">*</span>}
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {channelOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChannel(c)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                    form.channels.includes(c)
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-neutral-900"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Budget{err("budget") && <span className="text-red-500 ml-1">*</span>}
            </span>
            <div className="flex flex-wrap gap-2">
              {budgetOptions.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => update("budget", b)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    form.budget === b
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-neutral-900"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </label>
        </div>
      </div>

      {/* 03 — Sharpen the Pitch */}
      <div className="rounded-2xl border border-neutral-200 p-6">
        <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-5">
          03 — Sharpen the Pitch{" "}
          <span className="normal-case text-neutral-400">(optional)</span>
        </p>
        <div className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Competitors
            </span>
            <textarea
              rows={3}
              className={baseField}
              placeholder="Who else is in the conversation?"
              value={form.competitors}
              onChange={(e) => update("competitors", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Unique Selling Proposition
            </span>
            <textarea
              rows={3}
              className={baseField}
              placeholder="What makes them different?"
              value={form.usp}
              onChange={(e) => update("usp", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Notes
            </span>
            <textarea
              rows={3}
              className={baseField}
              placeholder="Anything else worth capturing"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          ← Cancel
        </button>
        <AnimatePresence>
          {errors.size > 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-geist-mono text-xs text-red-600"
            >
              {errors.size} required field{errors.size > 1 ? "s" : ""} missing
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-xl bg-neutral-900 px-8 py-3.5 font-medium text-white hover:bg-neutral-800 transition-colors"
        >
          Save & Generate Deck →
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MAIN CMS PAGE                                                       */
/* ================================================================== */

export default function CMSPage() {
  /* Navigation */
  const [view, setView] = useState<View>("dashboard");

  /* Data */
  const [projects, setProjects] = useState<Project[]>([]);
  const [intakes, setIntakes] = useState<IntakeRecord[]>([]);

  /* Editor */
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [slideData, setSlideData] = useState<SlideData[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Preview */
  const [previewSlides, setPreviewSlides] = useState<Slide[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);

  /* Template */
  const [templateSlides, setTemplateSlides] = useState<Slide[]>([]);
  const [templateIdx, setTemplateIdx] = useState(0);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  /* Intake data toggle */
  const [useIntakeData, setUseIntakeData] = useState(true);

  /* Search / filter */
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<Project["status"] | "all">("all");
  const [intakeSearch, setIntakeSearch] = useState("");


  /* Load on mount — seed mock intakes if library is empty */
  useEffect(() => {
    setProjects(getProjects());
    const existing = getIntakes();
    if (existing.length === 0) {
      MOCK_INTAKES.forEach(persistIntake);
      setIntakes(getIntakes());
    } else {
      setIntakes(existing);
    }
  }, []);

  /* Autosave (debounced 800 ms) */
  useEffect(() => {
    if (!activeProject || slideData.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const updated: Project = {
        ...activeProject,
        slideData,
        updatedAt: new Date().toISOString(),
      };
      persistProject(updated);
      setActiveProject(updated);
      setProjects(getProjects());
      setLastSaved(new Date());
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideData]);

  /* ── Helpers ── */

  const openEditor = (project: Project) => {
    setActiveProject(project);
    setSlideData(project.slideData);
    setLastSaved(null);
    setView("editor");
  };

  const createProject = (
    name: string,
    sourceMode: Project["sourceMode"],
    data: SlideData[],
    intakeId?: string
  ) => {
    const project: Project = {
      id: uid(),
      name,
      status: "draft",
      sourceMode,
      intakeId,
      slideData: data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    persistProject(project);
    setProjects(getProjects());
    openEditor(project);
  };

  /* ── Workflow 2: Manual build ── */
  const handleManualBuild = () => {
    const data = applyTemplate(slidesToData(buildSlides(emptyForm)));
    createProject(
      `Manual Deck — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      "manual",
      data
    );
  };

  /* ── Workflow 1: Select intake ── */
  const handleSelectIntake = (intake: IntakeRecord) => {
    const data = applyTemplate(slidesToData(buildSlides(intake.formData)));
    createProject(intake.name || intake.objective || "New Deck", "intake", data, intake.id);
  };

  /* ── Workflow 1: New intake form ── */
  const handleNewIntake = (form: FormState) => {
    const record: IntakeRecord = {
      id: uid(),
      name: form.objective || "Untitled",
      objective: form.objective,
      geography: form.geography,
      formData: form,
      createdAt: new Date().toISOString(),
    };
    persistIntake(record);
    setIntakes(getIntakes());
    const data = applyTemplate(slidesToData(buildSlides(form)));
    createProject(record.name, "intake", data, record.id);
  };

  /* ── Preview ── */
  const handlePreview = () => {
    setPreviewSlides(dataToSlides(slideData));
    setPreviewIdx(0);
    setView("preview");
  };

  const handleUpdatePreviewText = (idx: number, key: string, val: string) => {
    setPreviewSlides((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, texts: { ...s.texts, [key]: val } } : s))
    );
    setSlideData((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, texts: { ...s.texts, [key]: val } } : s))
    );
  };

  const handleUpdatePreviewImage = (idx: number, val: string) => {
    setPreviewSlides((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, image: val } : s))
    );
    setSlideData((prev) => prev.map((s, i) => (i === idx ? { ...s, image: val } : s)));
  };

  const runAIEnhancement = useCallback(async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    await new Promise((r) => setTimeout(r, 1500));
    const form =
      activeProject?.intakeId
        ? (intakes.find((i) => i.id === activeProject.intakeId)?.formData ?? emptyForm)
        : emptyForm;
    const enhanced = await enhanceWithAI(form, previewSlides);
    setPreviewSlides(enhanced);
    setSlideData(slidesToData(enhanced));
    setIsEnhancing(false);
  }, [isEnhancing, activeProject, intakes, previewSlides]);

  /* ── Intake data toggle ── */
  const handleToggleIntakeData = () => {
    if (!activeProject) return;
    const next = !useIntakeData;
    const msg = next
      ? "Re-apply client profile data? This will overwrite your current slide text."
      : "Remove client profile data and reset to template defaults? Text edits will be lost.";
    if (!confirm(msg)) return;
    const form =
      next && activeProject.intakeId
        ? (intakes.find((i) => i.id === activeProject.intakeId)?.formData ?? emptyForm)
        : emptyForm;
    const fresh = applyTemplate(slidesToData(buildSlides(form)));
    setSlideData((prev) =>
      fresh.map((s) => ({ ...s, image: prev.find((p) => p.id === s.id)?.image ?? s.image }))
    );
    setUseIntakeData(next);
  };

  /* ── Template ── */
  const handleEditTemplate = () => {
    const tplData = getTemplateData();
    // Discard stale stored data if it's missing any of the current 12 slides
    const valid = tplData && SLIDE_META.every((m) => tplData.some((d) => d.id === m.id));
    setTemplateSlides(valid ? dataToSlides(tplData!) : buildSlides(emptyForm));
    setTemplateIdx(0);
    setView("template");
  };

  const handleSaveTemplate = () => {
    persistTemplate(slidesToData(templateSlides));
    setIsSavingTemplate(true);
    setTimeout(() => setIsSavingTemplate(false), 2000);
  };

  const updateTemplateText = (idx: number, key: string, val: string) => {
    setTemplateSlides((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, texts: { ...s.texts, [key]: val } } : s))
    );
  };

  const updateTemplateImage = (idx: number, val: string) => {
    setTemplateSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, image: val } : s)));
  };

  /* ── Project management ── */
  const handleDeleteProject = (id: string) => {
    removeProject(id);
    setProjects(getProjects());
  };

  const handleDuplicateProject = (id: string) => {
    cloneProject(id);
    setProjects(getProjects());
  };

  const handleMarkReady = (id: string) => {
    const all = getProjects().map((p) =>
      p.id === id ? { ...p, status: "ready" as const, updatedAt: new Date().toISOString() } : p
    );
    writeLS("cms_projects", all);
    setProjects(all);
  };

  /* ── Intake management ── */
  const handleDeleteIntake = (id: string) => {
    removeIntake(id);
    setIntakes(getIntakes());
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  /* Full-screen preview */
  if (view === "preview") {
    return (
      <DeckViewer
        slides={previewSlides}
        currentSlideIndex={previewIdx}
        setCurrentSlideIndex={setPreviewIdx}
        updateSlideText={handleUpdatePreviewText}
        updateSlideImage={handleUpdatePreviewImage}
        onBack={() => setView("editor")}
        onEnhance={runAIEnhancement}
        isEnhancing={isEnhancing}
      />
    );
  }

  /* Full-screen template editor */
  if (view === "template") {
    return (
      <DeckViewer
        label="Template Editor"
        slides={templateSlides}
        currentSlideIndex={templateIdx}
        setCurrentSlideIndex={setTemplateIdx}
        updateSlideText={updateTemplateText}
        updateSlideImage={updateTemplateImage}
        onBack={() => setView("dashboard")}
        onEnhance={() => {}}
        isEnhancing={false}
        extraActions={
          <button
            onClick={handleSaveTemplate}
            disabled={isSavingTemplate}
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            {isSavingTemplate ? "✓ Saved!" : "💾 Save Template"}
          </button>
        }
      />
    );
  }

  /* Main CMS layout */
  const navItems: Array<{ id: View; icon: string; label: string }> = [
    { id: "dashboard", icon: "▤", label: "Dashboard" },
    { id: "projects", icon: "◈", label: "Projects" },
    { id: "intakes", icon: "◉", label: "Client Profiles" },
  ];

  return (
    <div className="flex bg-neutral-50 pt-16 min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-60 xl:w-64 shrink-0 flex-col bg-white border-r border-neutral-200 sticky top-16 self-start h-[calc(100vh-4rem)] z-40">
        <div className="p-6 border-b border-neutral-100">
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400">
            434 Media
          </p>
          <h1 className="font-ggx88 text-xl mt-0.5 leading-tight">Sales Deck CMS</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                view === item.id
                  ? "bg-neutral-900 text-white font-medium"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-100 space-y-1">
          <button
            onClick={handleEditTemplate}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <span className="w-5 text-center text-base">⚙</span> Edit Template
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        {/* Mobile nav bar */}
        <div className="lg:hidden sticky top-16 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
          <span className="font-ggx88 text-lg">Sales Deck CMS</span>
          <div className="flex gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  view === item.id
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {item.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════ DASHBOARD ══════════ */}
        {view === "dashboard" && (
          <div className="p-6 md:p-8 xl:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
              <p className="font-geist-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
                Welcome back
              </p>
              <h2 className="font-ggx88 text-4xl md:text-5xl mt-2">Dashboard</h2>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Total Projects", value: projects.length },
                { label: "Drafts", value: projects.filter((p) => p.status === "draft").length },
                { label: "Ready", value: projects.filter((p) => p.status === "ready").length },
                { label: "Intake Forms", value: intakes.length },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-neutral-200 p-5">
                  <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-400">
                    {stat.label}
                  </p>
                  <p className="font-ggx88 text-4xl mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* New Deck */}
            <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">
              New Deck
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleManualBuild}
                className="rounded-2xl border-2 border-neutral-200 bg-white p-7 text-center hover:border-neutral-900 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📄</div>
                <h3 className="font-semibold text-xl mb-2">Start with a Template</h3>
                <p className="text-sm text-neutral-500">
                  Open the current template and fill in every slide yourself.
                </p>
                <p className="mt-4 text-xs font-geist-mono text-neutral-400 group-hover:text-neutral-700 transition-colors">
                  Open blank editor →
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("intakes")}
                className="rounded-2xl border-2 border-neutral-200 bg-white p-7 text-center hover:border-neutral-900 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
                <h3 className="font-semibold text-xl mb-2">From Client Profile</h3>
                <p className="text-sm text-neutral-500">
                  Pick a saved client profile and generate a personalized deck instantly.
                </p>
                <p className="mt-4 text-xs font-geist-mono text-neutral-400 group-hover:text-neutral-700 transition-colors">
                  Browse profiles →
                </p>
              </motion.button>
            </div>

            <div className="flex justify-center mb-8">
              <button
                onClick={handleEditTemplate}
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-900 transition-colors border border-neutral-200 hover:border-neutral-400 rounded-full px-4 py-1.5"
              >
                <span className="text-base">⚙️</span> Edit Template
              </button>
            </div>

            {/* Recent projects */}
            <div className="flex items-center justify-between mb-4">
              <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
                Recent Projects
              </p>
              {projects.length > 5 && (
                <button
                  onClick={() => setView("projects")}
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  View all →
                </button>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
                <p className="text-neutral-400 text-sm">No projects yet. Create one above.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      {["Name", "Source", "Status", "Updated", "", ""].map((h) => (
                        <th
                          key={h}
                          className={`text-left px-5 py-3 font-geist-mono text-[10px] uppercase tracking-widest text-neutral-400 ${
                            h === "Source" ? "hidden sm:table-cell" : ""
                          } ${h === "Updated" ? "hidden md:table-cell" : ""}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 6).map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors cursor-pointer"
                        onClick={() => openEditor(p)}
                      >
                        <td className="px-5 py-3.5 font-medium text-neutral-900">{p.name}</td>
                        <td className="px-5 py-3.5 text-neutral-500 hidden sm:table-cell">
                          <span className="font-geist-mono text-[10px] uppercase tracking-widest">
                            {p.sourceMode === "intake" ? "from intake" : "manual"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-5 py-3.5 text-neutral-400 text-xs hidden md:table-cell">
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete "${p.name}"?`)) handleDeleteProject(p.id);
                              }}
                              className="text-neutral-400 hover:text-red-600 transition-colors text-sm"
                              aria-label="Delete project"
                            >
                              ✕
                            </button>
                            <span className="text-xs font-medium text-neutral-900 hover:underline">
                              Edit →
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══════════ PROJECTS ══════════ */}
        {view === "projects" && (
          <div className="p-6 md:p-8 xl:p-10 max-w-5xl mx-auto">
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <p className="font-geist-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
                  Management
                </p>
                <h2 className="font-ggx88 text-4xl mt-2">Projects</h2>
              </div>
              <div className="flex gap-2 mt-3 shrink-0">
                <button
                  onClick={() => setView("intakes")}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-900 transition-colors"
                >
                  + From Intake
                </button>
                <button
                  onClick={handleManualBuild}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 transition-colors"
                >
                  + Manual Build
                </button>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Search projects…"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 bg-white"
              />
              <select
                value={projectStatusFilter}
                onChange={(e) => setProjectStatusFilter(e.target.value as Project["status"] | "all")}
                className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900 bg-white"
              >
                <option value="all">All status</option>
                <option value="draft">Draft</option>
                <option value="ready">Ready</option>
                <option value="exported">Exported</option>
              </select>
            </div>

            {(() => {
              const filtered = projects.filter((p) => {
                const q = projectSearch.toLowerCase();
                return (
                  p.name.toLowerCase().includes(q) &&
                  (projectStatusFilter === "all" || p.status === projectStatusFilter)
                );
              });

              return filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
                  <p className="text-neutral-400 text-sm">No projects found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-medium text-neutral-900 truncate">{p.name}</span>
                          <StatusBadge status={p.status} />
                        </div>
                        <p className="text-xs text-neutral-400 font-geist-mono mt-1">
                          {p.sourceMode === "intake" ? "From intake" : "Manual"} ·{" "}
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        {p.status === "draft" && (
                          <button
                            onClick={() => handleMarkReady(p.id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            Mark Ready
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicateProject(p.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => openEditor(p)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════════ CLIENT PROFILES ══════════ */}
        {view === "intakes" && (
          <div className="p-6 md:p-8 xl:p-10 max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <p className="font-geist-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
                  New Deck
                </p>
                <h2 className="font-ggx88 text-4xl mt-2">Client Profiles</h2>
                <p className="text-neutral-500 mt-2 text-sm">
                  Select a saved client profile to generate a personalized sales deck.
                </p>
              </div>
              <button
                onClick={() => setView("new-intake")}
                className="mt-3 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm text-white hover:bg-neutral-800 transition-colors shrink-0"
              >
                + New Profile
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by company, objective, or location…"
              value={intakeSearch}
              onChange={(e) => setIntakeSearch(e.target.value)}
              className="w-full mb-5 rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900 bg-white"
            />

            {(() => {
              const q = intakeSearch.toLowerCase();
              const filtered = intakes.filter(
                (i) =>
                  i.name.toLowerCase().includes(q) ||
                  i.objective.toLowerCase().includes(q) ||
                  (i.geography ?? "").toLowerCase().includes(q)
              );

              return filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
                  <p className="text-neutral-400 text-sm mb-4">
                    {intakes.length === 0
                      ? "No client profiles saved yet."
                      : "No results match your search."}
                  </p>
                  <button
                    onClick={() => setView("new-intake")}
                    className="rounded-xl bg-neutral-900 px-6 py-2.5 text-sm text-white hover:bg-neutral-800 transition-colors"
                  >
                    Create First Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((intake) => (
                    <motion.div
                      key={intake.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-center gap-4 group hover:border-neutral-400 transition-colors"
                    >
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleSelectIntake(intake)}
                      >
                        <h3 className="font-medium text-neutral-900 truncate">{intake.name}</h3>
                        <p className="text-sm text-neutral-500 mt-0.5">
                          {intake.objective}
                          {intake.geography ? ` · ${intake.geography}` : ""}
                        </p>
                        <p className="text-xs text-neutral-400 font-geist-mono mt-1">
                          {new Date(intake.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleSelectIntake(intake)}
                          className="text-xs px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                        >
                          Generate Deck →
                        </button>
                        <button
                          onClick={() => handleDeleteIntake(intake.id)}
                          className="text-xs px-3 py-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════════ NEW CLIENT PROFILE ══════════ */}
        {view === "new-intake" && (
          <div className="p-6 md:p-8 xl:p-10 max-w-3xl mx-auto">
            <button
              onClick={() => setView("intakes")}
              className="mb-6 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              ← Back to Client Profiles
            </button>
            <p className="font-geist-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
              New Profile
            </p>
            <h2 className="font-ggx88 text-4xl mt-2 mb-8">Discovery Intake</h2>
            <IntakeForm onSubmit={handleNewIntake} onCancel={() => setView("intakes")} />
          </div>
        )}

        {/* ══════════ EDITOR ══════════ */}
        {view === "editor" && activeProject && (
          <div className="p-6 md:p-8 xl:p-10 max-w-3xl mx-auto pb-32">
            {/* Editor header */}
            {(() => {
              const filledCount = slideData.filter((s) =>
                SLIDE_META.find((m) => m.id === s.id)?.fields.some((f) => (s.texts[f.key] ?? "").trim())
              ).length;
              const total = SLIDE_META.length;
              const pct = Math.round((filledCount / total) * 100);
              return (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="font-semibold text-neutral-900 truncate">{activeProject.name}</h2>
                        <StatusBadge status={activeProject.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="font-geist-mono text-[10px] text-neutral-400">
                          {filledCount}/{total} slides filled
                        </p>
                        {lastSaved && (
                          <p className="font-geist-mono text-[10px] text-neutral-400">
                            · Autosaved {lastSaved.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePreview}
                      className="shrink-0 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm text-white hover:bg-neutral-800 transition-colors"
                    >
                      Preview Deck →
                    </motion.button>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Hint */}
            <div className="bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 mb-4 text-sm text-neutral-500">
              Expand each slide to edit its content. Changes are autosaved automatically.
              Click <strong className="text-neutral-700">Preview Deck</strong> to see the full presentation.
            </div>

            {/* Intake data toggle — only shown for intake-sourced projects */}
            {activeProject.sourceMode === "intake" && (
              <div className="flex items-center gap-4 mb-6 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">Include client profile data</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {useIntakeData ? "Slide text is populated from the intake form." : "Showing template defaults — client data cleared."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleIntakeData}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
                    useIntakeData ? "bg-neutral-900" : "bg-neutral-300"
                  }`}
                  aria-checked={useIntakeData}
                  role="switch"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      useIntakeData ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Accordion */}
            <SlideAccordion slideData={slideData} onChange={setSlideData} />

            {/* Fixed back button — always visible at bottom-left */}
            <button
              onClick={() => setView("dashboard")}
              className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-lg hover:bg-neutral-50 hover:border-neutral-400 transition-all"
            >
              <span className="text-base leading-none">←</span> Back to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/* ================================================================== */
/*  BUILD SLIDES                                                        */
/* ================================================================== */

function buildSlides(form: FormState): Slide[] {
  const defs: Omit<Slide, "node">[] = [
    {
      id: "title",
      image: "",
      texts: {
        company: form.objective || "Your Company",
        subtitle: `${form.geography || "Your Market"} · ${new Date().getFullYear()}`,
        tagline: "A 434 Media Proposal",
      },
    },
    {
      id: "heard",
      image: "",
      texts: {
        challenge:
          `• Current channels aren't scaling.\n• Brand awareness is limited.\n• Need a proven partner to drive growth.`,
        opportunity:
          `• Growing demand in ${form.geography || "your market"}.\n• Untapped audience segments ready to convert.\n• Data-driven media can unlock real ROI.`,
        outcome:
          `• Increase qualified leads and revenue.\n• Reduce cost per acquisition.\n• Build lasting brand recognition.\n• Create repeatable growth systems.`,
      },
    },
    {
      id: "opportunity",
      image: "",
      texts: {
        headline: `${form.objective || "Your Goal"} – The moment is now.`,
        bullets:
          `• Consumer behavior is shifting in your favor.\n• Competition is underinvesting in digital.\n• 434 Media is ready to capture share on your behalf.\n• The window to act is open – let's move.`,
      },
    },
    {
      id: "strategy",
      image: "",
      texts: {
        line1: `Acquire high-intent consumers using ${form.channels.join(", ") || "targeted channels"}.`,
        line2: "Build trust through relevant, educational content that informs decisions.",
        line3: "Retain and re-engage customers for compounding lifetime value.",
      },
    },
    {
      id: "plan",
      image: "",
      texts: {
        channels: form.channels.join(", ") || "Search, Social, Email",
        budget: form.budget || "TBD",
        geography: form.geography || "Local / Regional",
        audience: form.audience || "Your core audience",
      },
    },
    {
      id: "why",
      image: "",
      texts: {
        point1: form.usp || "Differentiated value proposition.",
        point2: form.whyNow || "The timing is right – we're ready.",
        point3: form.audience || "An engaged audience is already waiting.",
      },
    },
    {
      id: "audience",
      image: "",
      texts: {
        primary: form.audience || "Core demographic with high purchase intent.",
        geography: form.geography || "San Antonio and surrounding markets.",
        notes: form.notes || "Additional targeting details to be refined.",
      },
    },
    {
      id: "flow",
      image: "",
      texts: {
        steps: `Step 1: Consumer searches for ${form.objective || "your service"}\nStep 2: Discovers your brand through targeted media\nStep 3: Engages with content and takes action\nStep 4: Converts and receives value\nStep 5: Returns for additional services`,
      },
    },
    {
      id: "success",
      image: "",
      texts: {
        title: `${form.objective || "Growth"} Success Story`,
        challenge: form.whyNow || "Market need identified and validated.",
        solution: form.usp || "Tailored media strategy deployed at scale.",
        outcome: "Measurable lift in awareness, leads, and revenue.",
      },
    },
    {
      id: "metrics",
      image: "",
      texts: {
        budget: form.budget || "To be confirmed",
        channels: form.channels.join(", ") || "Search, Social, Email",
        kpi1: "Cost Per Lead",
        kpi2: "Return on Ad Spend",
        kpi3: "Brand Search Lift",
      },
    },
    {
      id: "engagement",
      image: "",
      texts: {
        strategy: `• Brand Strategy\n• Campaign Planning\n• Audience Research\n• Competitive Analysis`,
        acquisition: `• ${form.channels.join("\n• ") || "Paid Search\n• Paid Social\n• Display\n• Pre-Roll"}`,
        optimization: `• A/B Testing\n• Conversion Rate Optimization\n• Reporting & Analytics\n• Budget Pacing`,
      },
    },
    {
      id: "nextsteps",
      image: "",
      texts: {
        step1: "Kick-off call to align on goals and timeline.",
        step2: "Strategy and media plan delivered within 5 business days.",
        step3: "Campaign launch and live reporting dashboard.",
        closing: form.notes || "Let's build something that grows your business.",
      },
    },
  ];

  return defs.map((s) => ({
    ...s,
    node: ({ slide, updateText }) => {
      const t = slide.texts;
      const base = "h-full w-full select-none";

      // Background-image helpers: gradient overlay + uploaded photo
      const darkImg: React.CSSProperties = slide.image
        ? {
            backgroundImage: `linear-gradient(rgba(23,23,23,0.72),rgba(23,23,23,0.72)),url(${slide.image})`,
            backgroundSize: "100% 100%,cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }
        : {};
      const lightImg: React.CSSProperties = slide.image
        ? {
            backgroundImage: `linear-gradient(rgba(255,255,255,0.82),rgba(255,255,255,0.82)),url(${slide.image})`,
            backgroundSize: "100% 100%,cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }
        : {};

      if (s.id === "title") {
        return (
          <div
            className={`${base} relative flex flex-col justify-between bg-neutral-900 p-8 text-white overflow-hidden`}
            style={darkImg}
          >
            <Waveform className="absolute bottom-0 left-0 right-0 h-28 text-white" />
            <p className="font-geist-mono text-xs uppercase tracking-[0.3em] text-neutral-400">
              434 Media · Client Proposal
            </p>
            <div className="relative z-10">
              <EditableText
                as="h1"
                value={t.company}
                onChange={(v) => updateText("company", v)}
                className={`${HEAD} text-5xl md:text-6xl text-white mb-3`}
              />
              <EditableText
                value={t.subtitle}
                onChange={(v) => updateText("subtitle", v)}
                className="text-neutral-400 text-lg"
              />
            </div>
            <EditableText
              value={t.tagline}
              onChange={(v) => updateText("tagline", v)}
              className="font-geist-mono text-xs text-neutral-500 uppercase tracking-widest relative z-10"
            />
          </div>
        );
      }

      if (s.id === "heard") {
        return (
          <div className={`${base} grid grid-cols-3 divide-x divide-neutral-200`}>
            {(["challenge", "opportunity", "outcome"] as const).map((key, i) => (
              <div
                key={key}
                className={`${
                  i === 2 ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                } p-8 flex flex-col gap-4`}
                style={i === 2 ? darkImg : lightImg}
              >
                <p className="font-geist-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
                  {["The Challenge", "The Opportunity", "The Outcome"][i]}
                </p>
                <EditableText
                  value={t[key]}
                  onChange={(v) => updateText(key, v)}
                  className="text-sm leading-relaxed whitespace-pre-line"
                />
              </div>
            ))}
          </div>
        );
      }

      if (s.id === "opportunity") {
        return (
          <div className={`${base} flex flex-col justify-center bg-white p-8`} style={lightImg}>
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-4">
              The Opportunity
            </p>
            <EditableText
              as="h2"
              value={t.headline}
              onChange={(v) => updateText("headline", v)}
              className={`${HEAD} text-3xl md:text-4xl mb-5`}
            />
            <EditableText
              value={t.bullets}
              onChange={(v) => updateText("bullets", v)}
              className="text-neutral-600 leading-relaxed whitespace-pre-line text-sm md:text-base"
            />
          </div>
        );
      }

      if (s.id === "strategy") {
        return (
          <div
            className={`${base} bg-neutral-900 text-white flex flex-col justify-center p-8 gap-5`}
            style={darkImg}
          >
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400">
              Our Strategy
            </p>
            {(["line1", "line2", "line3"] as const).map((key, i) => (
              <div key={key} className="flex gap-6 items-start">
                <span className="font-ggx88 text-5xl text-neutral-700 leading-none">{i + 1}</span>
                <EditableText
                  value={t[key]}
                  onChange={(v) => updateText(key, v)}
                  className="text-lg leading-snug mt-1"
                />
              </div>
            ))}
          </div>
        );
      }

      if (s.id === "plan") {
        return (
          <div className={`${base} bg-white flex flex-col justify-center p-8`} style={lightImg}>
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-5">
              Media Plan
            </p>
            <div className="grid grid-cols-2 gap-5">
              {(["channels", "budget", "geography", "audience"] as const).map((key) => (
                <div key={key} className="border border-neutral-200 rounded-2xl p-6">
                  <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">
                    {key}
                  </p>
                  <EditableText
                    value={t[key]}
                    onChange={(v) => updateText(key, v)}
                    className="font-medium text-neutral-900"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (s.id === "why") {
        return (
          <div className={`${base} bg-white flex flex-col justify-center p-8`} style={lightImg}>
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-5">
              Why This Works
            </p>
            <div className="space-y-6">
              {(["point1", "point2", "point3"] as const).map((key, i) => (
                <div
                  key={key}
                  className="flex gap-5 items-start border-b border-neutral-100 pb-6 last:border-0"
                >
                  <span className="font-geist-mono text-xs text-neutral-300 mt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <EditableText
                    value={t[key]}
                    onChange={(v) => updateText(key, v)}
                    className="text-lg text-neutral-900 leading-snug"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (s.id === "audience") {
        return (
          <div
            className={`${base} bg-neutral-900 text-white flex flex-col justify-center p-8`}
            style={darkImg}
          >
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-5">
              Target Audience
            </p>
            <div className="space-y-5">
              {(["primary", "geography", "notes"] as const).map((key) => (
                <div key={key}>
                  <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
                    {key}
                  </p>
                  <EditableText
                    value={t[key]}
                    onChange={(v) => updateText(key, v)}
                    className="text-lg leading-snug"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (s.id === "flow") {
        const steps = (t.steps || "").split("\n").filter(Boolean);
        return (
          <div className={`${base} bg-neutral-900 text-white flex flex-col justify-center p-8`} style={darkImg}>
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-5">
              Customer Flow Journey
            </p>
            {steps.length > 0 ? (
              <div className="space-y-5">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <span className="font-ggx88 text-3xl text-neutral-700 leading-none shrink-0 w-8">
                      {i + 1}
                    </span>
                    <p className="text-base leading-snug text-neutral-100 pt-1">
                      {step.replace(/^Step \d+:\s*/i, "")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EditableText
                value={t.steps}
                onChange={(v) => updateText("steps", v)}
                className="text-base leading-loose whitespace-pre-line text-neutral-200"
              />
            )}
          </div>
        );
      }

      if (s.id === "success") {
        return (
          <div className={`${base} bg-white flex flex-col justify-center p-8`} style={lightImg}>
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-3">
              Case Study
            </p>
            <EditableText
              as="h2"
              value={t.title}
              onChange={(v) => updateText("title", v)}
              className={`${HEAD} text-3xl mb-5`}
            />
            <div className="grid grid-cols-3 gap-6">
              {(["challenge", "solution", "outcome"] as const).map((key) => (
                <div key={key} className="bg-neutral-50 rounded-2xl p-5">
                  <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
                    {key}
                  </p>
                  <EditableText
                    value={t[key]}
                    onChange={(v) => updateText(key, v)}
                    className="text-sm text-neutral-700 leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (s.id === "metrics") {
        return (
          <div
            className={`${base} bg-neutral-900 text-white flex flex-col justify-center p-8`}
            style={darkImg}
          >
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-5">
              Success Metrics
            </p>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {(["kpi1", "kpi2", "kpi3"] as const).map((key) => (
                <div key={key} className="border border-neutral-700 rounded-2xl p-6 text-center">
                  <EditableText
                    value={t[key]}
                    onChange={(v) => updateText(key, v)}
                    className="text-sm text-neutral-300"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(["budget", "channels"] as const).map((key) => (
                <div key={key} className="border border-neutral-700 rounded-2xl p-5">
                  <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-1">
                    {key}
                  </p>
                  <EditableText
                    value={t[key]}
                    onChange={(v) => updateText(key, v)}
                    className="font-medium"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (s.id === "engagement") {
        const categories = [
          { key: "strategy" as const, label: "Strategy" },
          { key: "acquisition" as const, label: "Acquisition" },
          { key: "optimization" as const, label: "Optimization" },
        ];
        return (
          <div className={`${base} bg-white flex flex-col justify-center p-8`} style={lightImg}>
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-5">
              Recommended Engagement
            </p>
            <div className="grid grid-cols-3 gap-5">
              {categories.map(({ key, label }) => (
                <div key={key} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
                  <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
                    {label}
                  </p>
                  <EditableText
                    value={t[key]}
                    onChange={(v) => updateText(key, v)}
                    className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      /* nextsteps — default last slide */
      return (
        <div
          className={`${base} relative bg-neutral-900 text-white flex flex-col justify-between p-8 overflow-hidden`}
          style={darkImg}
        >
          <Waveform className="absolute top-0 left-0 right-0 h-24 text-white rotate-180" />
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 relative z-10">
            Next Steps
          </p>
          <div className="space-y-6 relative z-10">
            {(["step1", "step2", "step3"] as const).map((key, i) => (
              <div key={key} className="flex gap-5 items-start">
                <span className="font-geist-mono text-xs text-neutral-500 mt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <EditableText
                  value={t[key]}
                  onChange={(v) => updateText(key, v)}
                  className="text-lg leading-snug"
                />
              </div>
            ))}
          </div>
          <EditableText
            value={t.closing}
            onChange={(v) => updateText("closing", v)}
            className="font-geist-mono text-xs text-neutral-400 italic relative z-10"
          />
        </div>
      );
    },
  }));
}

/* ================================================================== */
/*  AI ENHANCEMENT (mock)                                              */
/* ================================================================== */

async function enhanceWithAI(form: FormState, slides: Slide[]): Promise<Slide[]> {
  await new Promise((r) => setTimeout(r, 1000));
  const enhanced = slides.map((s) => ({ ...s, texts: { ...s.texts } }));

  for (const slide of enhanced) {
    if (slide.id === "title") {
      slide.texts.company = `${form.objective || "Your Company"} — Powered by 434 Media`;
    } else if (slide.id === "heard") {
      slide.texts.challenge =
        `• Heavy reliance on paid search — limiting organic growth.\n• Limited awareness outside existing demand channels.\n• Need for scalable customer acquisition.`;
      slide.texts.opportunity =
        `• Growing consumer demand in ${form.geography || "your market"} — the market is ready.\n• Strong operations and expertise — a solid foundation.\n• Ability to scale rapidly into additional markets.`;
      slide.texts.outcome =
        `• Increase booked conversions — drive revenue.\n• Reduce customer acquisition cost — improve efficiency.\n• Build sustainable brand awareness — become the go-to.\n• Create repeatable growth systems — scale with confidence.`;
    } else if (slide.id === "opportunity") {
      slide.texts.headline = `${form.objective || "Your Goal"} — not just a goal, a movement.`;
      slide.texts.bullets =
        `• Consumer expectations are rising — we exceed them.\n• Your competition is underinvesting — we capitalize.\n• Timing favors bold, data-driven moves — we move fast.\n• 434 Media has the network, tools, and track record.`;
    } else if (slide.id === "strategy") {
      slide.texts.line1 = `Acquire consumers actively searching for solutions — using ${
        form.channels.join(", ") || "precision targeting"
      }.`;
      slide.texts.line2 =
        "Build trust through education and authentic brand storytelling — earned attention.";
      slide.texts.line3 =
        "Curate repeat customers through ongoing engagement — loyalty that compounds.";
    } else if (slide.id === "plan") {
      slide.texts.channels = form.channels.join(", ") || slide.texts.channels;
    } else if (slide.id === "why") {
      if (form.usp) slide.texts.point1 = form.usp;
      if (form.whyNow) slide.texts.point2 = form.whyNow;
      if (form.audience) slide.texts.point3 = form.audience;
    } else if (slide.id === "audience") {
      if (form.audience) slide.texts.primary = form.audience;
      if (form.geography) slide.texts.geography = form.geography;
    } else if (slide.id === "success") {
      slide.texts.title = `${form.objective || "Growth"} Success Story`;
      if (form.whyNow) slide.texts.challenge = form.whyNow;
      if (form.usp) slide.texts.solution = form.usp;
    } else if (slide.id === "metrics") {
      if (form.budget) slide.texts.budget = form.budget;
      slide.texts.channels = form.channels.join(", ") || slide.texts.channels;
    } else if (slide.id === "nextsteps") {
      if (form.notes) slide.texts.closing = form.notes;
    }
  }

  return enhanced;
}