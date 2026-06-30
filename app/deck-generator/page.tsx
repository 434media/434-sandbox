"use client";

import { useState, useRef, type ReactNode, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { ScrambleText } from "@/components/ScrambleText";

/* ------------------------------------------------------------------ */
/*  Config                                                            */
/* ------------------------------------------------------------------ */

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

// Pre‑fill with helpful prompts so fields are never blank
const initialForm: FormState = {
  objective: "",
  whyNow: "Market timing is critical because…",
  geography: "e.g., San Antonio, South Texas",
  audience: "Describe your target audience in detail…",
  channels: [],
  budget: "",
  competitors: "List main competitors",
  usp: "What makes you unique?",
  notes: "Any additional context",
};

const requiredFields: (keyof FormState)[] = [
  "objective",
  "whyNow",
  "geography",
  "audience",
  "channels",
  "budget",
];

/* ------------------------------------------------------------------ */
/*  Motion variants                                                   */
/* ------------------------------------------------------------------ */

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07 },
  },
};


const baseField =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-neutral-900 placeholder-neutral-400 " +
  "transition-colors outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

/* ------------------------------------------------------------------ */
/*  Form Components                                                   */
/* ------------------------------------------------------------------ */

function FieldShell({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-geist-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        {label}
        {required && <span className="ml-1 text-neutral-900">*</span>}
      </span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 block text-xs text-red-600"
          >
            Required
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

// Collapsible Section with + / - toggle
function CollapsibleSection({
  index,
  title,
  children,
  fieldNames,
  errors,
}: {
  index: string;
  title: string;
  children: ReactNode;
  fieldNames: string[];
  errors: Set<string>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasError = fieldNames.some((name) => errors.has(name));

  const toggle = () => setIsExpanded((prev) => !prev);

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-3xl border border-neutral-200 p-6 shadow-sm"
    >
      {/* Header with toggle */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={toggle}
      >
        <div className="flex items-baseline gap-3">
          <span className="font-geist-mono text-xs text-neutral-400">{index}</span>
          <h2 className="font-ggx88 text-3xl">{title}</h2>
          {hasError && (
            <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
        </div>
        <button
          type="button"
          className="text-2xl font-light text-neutral-400 hover:text-neutral-900 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {/* Body with animation */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Slide components for the pitch deck (editable)                    */
/* ------------------------------------------------------------------ */

const HEAD = "font-ggx88 font-black uppercase tracking-tighter leading-[0.85] text-neutral-900";

function EditableText({
  value,
  onChange,
  className = "",
  as = "p",
}: {
  value: string;
  onChange: (newVal: string) => void;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3" | "li" | "span";
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setEditing(false);
    }
    if (e.key === "Escape") {
      setEditing(false);
    }
  };

  if (editing) {
    const common = "w-full bg-transparent border-b border-neutral-900 outline-none text-inherit font-inherit resize-none";
    if (as === "h1" || as === "h2" || as === "h3") {
      return (
        <input
          ref={inputRef as any}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${common} text-inherit font-inherit ${className}`}
        />
      );
    }
    return (
      <textarea
        ref={inputRef as any}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        rows={3}
        className={`${common} ${className}`}
      />
    );
  }

  const Component = as;
  return (
    <Component
      onClick={() => setEditing(true)}
      className={`cursor-text hover:bg-neutral-100/50 transition-colors rounded px-1 ${className}`}
    >
      {value || <span className="text-neutral-400 italic">Click to edit</span>}
    </Component>
  );
}

function EditableImage({
  src,
  onChange,
  className = "",
}: {
  src?: string;
  onChange: (dataUrl: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onChange(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`relative overflow-hidden bg-neutral-300 cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Slide image"
          className="absolute inset-0 h-full w-full object-cover grayscale"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: "repeating-linear-gradient(135deg, #d4d4d4 0 14px, #c8c8c8 14px 28px)",
          }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">
          Change image
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Slide data structure                                              */
/* ------------------------------------------------------------------ */

type Slide = {
  id: string;
  node: (props: { slide: Slide; updateText: (key: string, val: string) => void; updateImage: (val: string) => void }) => ReactNode;
  texts: Record<string, string>;
  image: string;
};

/* ------------------------------------------------------------------ */
/*  Deck Viewer                                                       */
/* ------------------------------------------------------------------ */

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
}: {
  slides: Slide[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (i: number) => void;
  updateSlideText: (slideIdx: number, key: string, val: string) => void;
  updateSlideImage: (slideIdx: number, val: string) => void;
  onBack: () => void;
  onEnhance: () => void;
  isEnhancing: boolean;
  extraActions?: ReactNode;
}) {
  const paginate = (d: number) => {
    const n = currentSlideIndex + d;
    if (n < 0 || n >= slides.length) return;
    setCurrentSlideIndex(n);
  };

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
  }, [currentSlideIndex, slides.length]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-neutral-950 font-geist-sans text-white">
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
                className="absolute inset-0 overflow-y-auto overflow-x-hidden md:overflow-hidden"
              >
                {slides[currentSlideIndex].node({
                  slide: slides[currentSlideIndex],
                  updateText: (key, val) => updateSlideText(currentSlideIndex, key, val),
                  updateImage: (val) => updateSlideImage(currentSlideIndex, val),
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            aria-label="Previous slide"
            onClick={() => paginate(-1)}
            disabled={currentSlideIndex === 0}
            className="absolute bottom-0 left-0 top-0 hidden w-[12%] cursor-w-resize disabled:cursor-default md:block"
          />
          <button
            aria-label="Next slide"
            onClick={() => paginate(1)}
            disabled={currentSlideIndex === slides.length - 1}
            className="absolute bottom-0 right-0 top-0 hidden w-[12%] cursor-e-resize disabled:cursor-default md:block"
          />
        </div>
      </div>

      <footer className="flex h-16 shrink-0 items-center justify-between border-t border-neutral-900 bg-neutral-950 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            ← Edit form
          </button>
          <span className="font-geist-mono text-xs text-neutral-400">
            <span className="font-bold text-white">{String(currentSlideIndex + 1).padStart(2, "0")}</span> /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-4">
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
                  i === currentSlideIndex ? "w-6 bg-white" : "w-1.5 bg-neutral-600 hover:bg-neutral-400"
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

        <div className="flex items-center gap-4">
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
                Enhancing...
              </span>
            ) : (
              "✨ Enhance with AI"
            )}
          </button>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            434 Media
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function UnifiedPage() {
  const [step, setStep] = useState<"form" | "deck">("form");
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Set<keyof FormState>>(new Set());
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  // ---- Form logic ----
  const updateForm = <K extends keyof FormState>(name: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors.has(name)) {
      setErrors((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }
  };

  const toggleChannel = (channel: string) => {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(channel)
        ? f.channels.filter((c) => c !== channel)
        : [...f.channels, channel],
    }));
    if (errors.has("channels")) {
      setErrors((prev) => {
        const next = new Set(prev);
        next.delete("channels");
        return next;
      });
    }
  };

  const handleSubmit = () => {
    const missing = requiredFields.filter((key) => {
      const v = form[key];
      return Array.isArray(v) ? v.length === 0 : v.trim() === "";
    });
    if (missing.length) {
      setErrors(new Set(missing));
      document
        .querySelector(`[data-field="${missing[0]}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors(new Set());

    const generated = buildSlides(form);
    setSlides(generated);
    setCurrentSlideIndex(0);
    setStep("deck");
  };

  const err = (k: keyof FormState) => errors.has(k);
  const field = (k: keyof FormState) =>
    baseField + (err(k) ? " border-red-500" : " border-neutral-300");

  // ---- Deck logic ----
  const updateSlideText = (slideIdx: number, key: string, val: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[slideIdx].texts[key] = val;
      return updated;
    });
  };

  const updateSlideImage = (slideIdx: number, val: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[slideIdx].image = val;
      return updated;
    });
  };

  // ---- AI Enhancement ----
  const runAIEnhancement = useCallback(async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const enhancedSlides = await enhanceWithAI(form, slides);
    setSlides(enhancedSlides);
    setIsEnhancing(false);
  }, [form, slides, isEnhancing]);

  // ---- Render ----
  return (
    <section className="min-h-screen bg-white">
      {step === "form" ? (
        /* -------- FORM MODE -------- */
        <div className="px-6 pt-28 pb-24">
          <div ref={formTopRef} className="mx-auto max-w-3xl">
            <p className="font-geist-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              434 Media · Client Success Tool
            </p>
            <h1 className="mt-4 font-ggx88 text-5xl md:text-7xl">
              <ScrambleText text="Discovery Intake" scrambleOnMount duration={28} />
            </h1>
            <p className="mt-6 max-w-2xl leading-relaxed text-neutral-600">
              Fill out the form below to generate a personalized pitch deck. You'll be able to edit
              every slide and replace images.
            </p>

            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 space-y-6"
            >
              {/* 01 — THE OPPORTUNITY */}
              <CollapsibleSection
                index="01"
                title="The Opportunity"
                fieldNames={["objective", "whyNow", "geography", "audience"]}
                errors={errors}
              >
                <div className="space-y-5">
                  <div data-field="objective">
                    <FieldShell label="Primary Objective" required error={err("objective")}>
                      <div className="flex flex-wrap gap-2">
                        {objectiveOptions.map((o) => {
                          const active = form.objective === o;
                          return (
                            <motion.button
                              key={o}
                              type="button"
                              whileTap={{ scale: 0.96 }}
                              onClick={() => updateForm("objective", o)}
                              className={
                                "rounded-full border px-4 py-2 text-sm transition-colors " +
                                (active
                                  ? "border-neutral-900 bg-neutral-900 text-white"
                                  : "border-neutral-300 text-neutral-700 hover:border-neutral-900")
                              }
                            >
                              {o}
                            </motion.button>
                          );
                        })}
                      </div>
                    </FieldShell>
                  </div>
                  <div data-field="whyNow">
                    <FieldShell label="Why now?" required error={err("whyNow")}>
                      <textarea
                        rows={3}
                        className={field("whyNow")}
                        placeholder="What's driving the timing?"
                        value={form.whyNow}
                        onChange={(e) => updateForm("whyNow", e.target.value)}
                      />
                    </FieldShell>
                  </div>
                  <div data-field="geography">
                    <FieldShell label="Target Geography" required error={err("geography")}>
                      <input
                        className={field("geography")}
                        placeholder="San Antonio, South Texas…"
                        value={form.geography}
                        onChange={(e) => updateForm("geography", e.target.value)}
                      />
                    </FieldShell>
                  </div>
                  <div data-field="audience">
                    <FieldShell label="Target Audience" required error={err("audience")}>
                      <textarea
                        rows={3}
                        className={field("audience")}
                        placeholder="Who are we trying to reach?"
                        value={form.audience}
                        onChange={(e) => updateForm("audience", e.target.value)}
                      />
                    </FieldShell>
                  </div>
                </div>
              </CollapsibleSection>

              {/* 02 — MEDIA PLAN INPUTS */}
              <CollapsibleSection
                index="02"
                title="Media Plan Inputs"
                fieldNames={["channels", "budget"]}
                errors={errors}
              >
                <div data-field="channels">
                  <FieldShell label="Channels of Interest" required error={err("channels")}>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {channelOptions.map((c) => {
                        const active = form.channels.includes(c);
                        return (
                          <motion.button
                            key={c}
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => toggleChannel(c)}
                            className={
                              "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors " +
                              (active
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 text-neutral-700 hover:border-neutral-900")
                            }
                          >
                            {c}
                          </motion.button>
                        );
                      })}
                    </div>
                  </FieldShell>
                </div>
                <div className="mt-5" data-field="budget">
                  <FieldShell label="Budget" required error={err("budget")}>
                    <div className="flex flex-wrap gap-2">
                      {budgetOptions.map((b) => {
                        const active = form.budget === b;
                        return (
                          <motion.button
                            key={b}
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => updateForm("budget", b)}
                            className={
                              "rounded-full border px-4 py-2 text-sm transition-colors " +
                              (active
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 text-neutral-700 hover:border-neutral-900")
                            }
                          >
                            {b}
                          </motion.button>
                        );
                      })}
                    </div>
                  </FieldShell>
                </div>
              </CollapsibleSection>

              {/* 03 — SHARPEN THE PITCH */}
              <CollapsibleSection
                index="03"
                title="Sharpen the Pitch"
                fieldNames={["competitors", "usp", "notes"]}
                errors={errors}
              >
                <div className="space-y-5">
                  <FieldShell label="Competitors">
                    <textarea
                      rows={3}
                      className={baseField + " border-neutral-300"}
                      placeholder="Who else is in the conversation?"
                      value={form.competitors}
                      onChange={(e) => updateForm("competitors", e.target.value)}
                    />
                  </FieldShell>
                  <FieldShell label="Unique Selling Proposition">
                    <textarea
                      rows={3}
                      className={baseField + " border-neutral-300"}
                      placeholder="What makes them different?"
                      value={form.usp}
                      onChange={(e) => updateForm("usp", e.target.value)}
                    />
                  </FieldShell>
                  <FieldShell label="Notes">
                    <textarea
                      rows={4}
                      className={baseField + " border-neutral-300"}
                      placeholder="Anything else worth capturing"
                      value={form.notes}
                      onChange={(e) => updateForm("notes", e.target.value)}
                    />
                  </FieldShell>
                </div>
              </CollapsibleSection>

              {/* SUBMIT */}
              <div className="flex items-center justify-between pt-2">
                <AnimatePresence>
                  {errors.size > 0 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-geist-mono text-xs uppercase tracking-[0.15em] text-red-600"
                    >
                      {errors.size} required field{errors.size > 1 ? "s" : ""} left
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="ml-auto rounded-xl bg-neutral-900 px-8 py-3.5 font-medium text-white"
                >
                  Generate Pitch Deck →
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <DeckViewer
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          setCurrentSlideIndex={setCurrentSlideIndex}
          updateSlideText={updateSlideText}
          updateSlideImage={updateSlideImage}
          onBack={() => setStep("form")}
          onEnhance={runAIEnhancement}
          isEnhancing={isEnhancing}
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  AI Enhancement function (mock – replace with real API)            */
/* ------------------------------------------------------------------ */

async function enhanceWithAI(form: FormState, slides: Slide[]): Promise<Slide[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const enhanced = slides.map((slide) => ({
    ...slide,
    texts: { ...slide.texts },
  }));

  for (let i = 0; i < enhanced.length; i++) {
    const slide = enhanced[i];
    const keys = Object.keys(slide.texts);
    for (const key of keys) {
      let current = slide.texts[key];
      if (slide.id === "title" && key === "company") {
        current = `🚀 ${form.objective || "Your Company"} – Unleashing Growth in ${form.geography || "your market"}`;
      } else if (slide.id === "heard") {
        if (key === "challenge") {
          current = `• Heavy reliance on paid search — limiting organic growth.\n• Limited awareness outside existing demand channels — untapped potential.\n• Need for scalable customer acquisition — we have the solution.`;
        } else if (key === "opportunity") {
          current = `• Growing consumer demand for direct-access healthcare — the market is ready.\n• Strong operation and expertise — a solid foundation.\n• Ability to scale rapidly into additional markets — the time is now.`;
        } else if (key === "outcome") {
          current = `• Increase booked appointments — drive revenue.\n• Reduce customer acquisition cost — improve efficiency.\n• Build sustainable brand awareness — become the go-to.\n• Create repeatable growth systems — scale with confidence.`;
        }
      } else if (slide.id === "opportunity" && key === "headline") {
        current = `${form.objective} – Not just a goal, a movement.`;
      } else if (slide.id === "opportunity" && key === "bullets") {
        current = `• Consumers increasingly expect healthcare on demand — we deliver.\n• Health information is becoming consumer controlled — we empower.\n• Privacy and convenience continue to drive adoption — we lead.\n• ${form.objective} can become a trusted destination — we build trust.`;
      } else if (slide.id === "strategy") {
        if (key === "line1") current = `Acquire consumers actively seeking answers — using ${form.channels.join(", ")}.`;
        else if (key === "line2") current = `Build trust through education on relevant health content — informed decisions.`;
        else if (key === "line3") current = `Curate repeat customers through ongoing engagement — loyalty that lasts.`;
      } else if (slide.id === "plan" && key === "channels") {
        current = form.channels.join(", ") || "Search, Social, Email";
      } else if (slide.id === "why") {
        if (key === "point1") current = form.usp || "Unique value proposition that resonates.";
        else if (key === "point2") current = form.whyNow || "Timing is critical – and we're ready.";
        else if (key === "point3") current = form.audience || "Target audience is engaged and waiting.";
      } else if (slide.id === "audience") {
        if (key === "primary") current = form.audience || "Young Adults (18–34) – high demand.";
        else if (key === "geography") current = form.geography || "San Antonio – the perfect testbed.";
      } else if (slide.id === "success") {
        if (key === "title") current = `${form.objective} Success Story`;
        else if (key === "challenge") current = form.whyNow || "Market need identified.";
        else if (key === "solution") current = form.usp || "Our unique approach delivered results.";
        else if (key === "outcome") current = "Measurable reach and ecosystem participation that transformed awareness into action.";
      } else if (slide.id === "metrics") {
        if (key === "budget") current = form.budget || "Under $5k";
        else if (key === "channels") current = form.channels.join(", ") || "Search, Social, Email";
      } else if (slide.id === "nextsteps" && key === "closing") {
        current = form.notes || "The objective is to build a scalable consumer healthcare brand powered by information, trust, and access.";
      }
      slide.texts[key] = current || "Click to edit";
    }
  }

  return enhanced;
}

/* ------------------------------------------------------------------ */
/*  Build slides from form data                                      */
/* ------------------------------------------------------------------ */

function buildSlides(form: FormState): Slide[] {
  const slide = (
    id: string,
    image: string,
    texts: Record<string, string>,
    render: (props: { slide: Slide; updateText: (key: string, val: string) => void; updateImage: (val: string) => void }) => ReactNode
  ): Slide => ({
    id,
    image,
    texts,
    node: render,
  });

  const defaultImages = {
    title: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
    opportunity: "https://images.unsplash.com/photo-1551076805-e18690c5e561?q=80&w=2070&auto=format&fit=crop",
    why: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop",
    audience: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop",
    flowLeft: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    flowRight: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
    success: "https://images.unsplash.com/photo-1576091160550-2173ff9e5eb3?q=80&w=2070&auto=format&fit=crop",
    metrics: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2070&auto=format&fit=crop",
    engagement: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop",
    plan: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop",
  };

  // ---- SLIDE 01: TITLE ----
  const titleSlide = slide(
    "title",
    defaultImages.title,
    { company: form.objective || "Your Company" },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col md:flex-row">
        <EditableImage
          src={slide.image}
          onChange={updateImage}
          className="h-[40vh] min-h-[40vh] w-full shrink-0 md:h-full md:min-h-0 md:w-1/2"
        />
        <div className="flex w-full flex-1 flex-col items-center justify-center bg-white px-6 py-12 md:w-1/2 md:px-[3cqw] md:py-0">
          <h1 className={`${HEAD} w-full text-center text-6xl md:text-[8cqw]`}>
            <EditableText
              value={slide.texts.company}
              onChange={(v) => updateText("company", v)}
              as="h1"
              className="text-inherit"
            />
          </h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-neutral-900 md:mt-[2.5cqw] md:text-[1.3cqw]">
            Presented By : 434 Media
          </p>
        </div>
      </div>
    )
  );

  // ---- SLIDE 02: WHAT WE HEARD ----
  const heardSlide = slide(
    "heard",
    defaultImages.opportunity,
    {
      challenge: "Heavy reliance on paid search\nLimited awareness outside existing demand channels\nNeed for scalable customer acquisition",
      opportunity: "Growing consumer demand for direct-access healthcare\nStrong operation and expertise\nAbility to scale rapidly into additional markets",
      outcome: "Increase booked appointments\nReduce customer acquisition cost\nBuild sustainable brand awareness\nCreate repeatable growth systems",
    },
    ({ slide, updateText, updateImage }) => (
      <div className="relative flex min-h-full w-full flex-col items-center justify-center bg-[#F8F9FA] px-6 py-12 md:px-[5cqw] md:py-0">
        <Waveform />
        <h2 className={`${HEAD} relative z-10 w-full text-center text-4xl md:text-[7cqw]`}>WHAT WE HEARD</h2>
        <div className="relative z-10 mt-8 grid w-full grid-cols-1 gap-8 md:mt-[3cqw] md:grid-cols-3 md:gap-[3cqw]">
          {[
            { h: "Current Challenges", key: "challenge" },
            { h: "Current Opportunities", key: "opportunity" },
            { h: "Desired Outcomes", key: "outcome" },
          ].map((col) => (
            <div key={col.h} className="space-y-3 md:space-y-[1.4cqw]">
              <h3 className="inline-block border-b-2 border-neutral-900 pb-1 text-lg font-bold text-neutral-900 md:pb-[0.3cqw] md:text-[1.7cqw]">
                {col.h}
              </h3>
              <div className="list-disc space-y-2 pl-5 text-sm text-neutral-800 md:space-y-[0.8cqw] md:pl-[1.4cqw] md:text-[1.3cqw]">
                <EditableText
                  value={slide.texts[col.key]}
                  onChange={(v) => updateText(col.key, v)}
                  as="p"
                  className="whitespace-pre-wrap"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );

  // ---- SLIDE 03: OPPORTUNITY ----
  const opportunitySlide = slide(
    "opportunity",
    defaultImages.opportunity,
    {
      headline: `${form.objective} – ${form.geography || "Target Market"}`,
      bullets: `• Consumers increasingly expect healthcare on demand\n• Health information is becoming consumer controlled\n• Privacy and convenience continue to drive adoption\n• ${form.objective} can become a trusted destination`,
    },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col-reverse bg-white md:flex-row">
        <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 md:w-1/2 md:px-[4cqw] md:py-0">
          <h2 className={`${HEAD} mb-4 text-4xl md:mb-[2.5cqw] md:text-[5.5cqw]`}>OPPORTUNITY</h2>
          <h3 className="mb-4 text-lg font-bold leading-snug text-neutral-900 md:mb-[2cqw] md:text-[1.6cqw]">
            <EditableText
              value={slide.texts.headline}
              onChange={(v) => updateText("headline", v)}
              as="h3"
              className="text-inherit"
            />
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-xs font-bold uppercase leading-relaxed tracking-wider text-neutral-800 md:space-y-[0.9cqw] md:pl-[1.4cqw] md:text-[1.1cqw]">
            <EditableText
              value={slide.texts.bullets}
              onChange={(v) => updateText("bullets", v)}
              as="p"
              className="whitespace-pre-wrap"
            />
          </ul>
        </div>
        <EditableImage
          src={slide.image}
          onChange={updateImage}
          className="h-[40vh] min-h-[40vh] w-full shrink-0 md:h-full md:min-h-0 md:w-1/2"
        />
      </div>
    )
  );

  // ---- SLIDE 04: STRATEGIC RECOMMENDATION ----
  const strategySlide = slide(
    "strategy",
    defaultImages.plan,
    {
      line1: "Acquire consumers actively seeking answers.",
      line2: "Building trust through education on relevant health content.",
      line3: "Curate repeat customers through ongoing health engagement in order to retain established trust.",
    },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-white px-6 py-12 md:flex-row md:px-[4cqw] md:py-0">
        <div className="flex w-full flex-col justify-center text-center md:w-3/5 md:pr-[3cqw] md:text-left">
          <h2 className={`${HEAD} mb-4 text-4xl md:mb-[2.5cqw] md:text-[5.5cqw]`}>
            STRATEGIC
            <br className="hidden md:block" /> RECOMMENDATION
          </h2>
          <div className="space-y-4 text-base font-medium text-neutral-800 md:space-y-[1.6cqw] md:text-[1.5cqw]">
            <EditableText
              value={slide.texts.line1}
              onChange={(v) => updateText("line1", v)}
              as="p"
              className="text-inherit"
            />
            <EditableText
              value={slide.texts.line2}
              onChange={(v) => updateText("line2", v)}
              as="p"
              className="text-inherit"
            />
            <EditableText
              value={slide.texts.line3}
              onChange={(v) => updateText("line3", v)}
              as="p"
              className="text-inherit"
            />
          </div>
        </div>
        <div className="relative my-12 flex aspect-square w-[75vw] max-w-[320px] shrink-0 items-center justify-center md:my-0 md:w-[26cqw] md:max-w-none">
          {(
            [
              ["Acquire", "top-0 left-1/2 -translate-x-1/2"],
              ["Educate", "right-0 top-1/2 -translate-y-1/2"],
              ["Retain", "bottom-0 left-1/2 -translate-x-1/2"],
              ["Refer", "left-0 top-1/2 -translate-y-1/2"],
            ] as const
          ).map(([label, pos]) => (
            <div
              key={label}
              className={`absolute ${pos} z-10 rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold uppercase tracking-widest text-neutral-900 shadow-md md:px-[1.5cqw] md:py-[0.7cqw] md:text-[1.1cqw]`}
            >
              {label}
            </div>
          ))}
          <div className="h-[50vw] w-[50vw] max-h-[220px] max-w-[220px] animate-[spin_22s_linear_infinite] rounded-full border-[0.5cqw] border-dashed border-neutral-300 md:h-[16cqw] md:w-[16cqw] md:max-h-none md:max-w-none" />
        </div>
      </div>
    )
  );

  // ---- SLIDE 05: MARKETING PLAN ----
  const planSlide = slide(
    "plan",
    defaultImages.plan,
    {
      channels: form.channels.join(", ") || "Search, Social, Email",
      budget: form.budget || "Under $5k",
    },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-white py-12 md:flex-row md:py-0">
        <div className="mb-8 flex w-full flex-col justify-center px-6 text-center md:mb-0 md:h-full md:w-[44%] md:px-[4cqw] md:text-left">
          <h2 className={`${HEAD} text-4xl md:text-[5.5cqw]`}>
            RECOMMENDED
            <br className="hidden md:block" /> MARKETING
            <br className="hidden md:block" /> PLAN
          </h2>
          <p className="mt-2 text-sm text-neutral-600 md:mt-[1cqw] md:text-[1.3cqw]">
            Budget: <EditableText value={slide.texts.budget} onChange={(v) => updateText("budget", v)} as="span" className="inline-block" />
          </p>
        </div>
        <div className="flex w-full flex-col justify-center gap-8 px-6 md:w-[56%] md:gap-[2cqw] md:px-[4cqw]">
          {[
            { n: "Phase 1", t: "Demand Capture", items: ["Search", "Local SEO", "Landing Pages", "Conversion Optimization"] },
            { n: "Phase 2", t: "Demand Expansion", items: ["Paid Social", "YouTube", "Dating App Advertising", "Influencer Partnerships"] },
            { n: "Phase 3", t: "Brand Development", items: ["Content Marketing", "Employer Partnerships", "Public Relations", "Community Partnerships"] },
          ].map((p) => (
            <div key={p.n}>
              <h3 className="text-xl font-black text-neutral-900 md:text-[1.7cqw]">{p.n}</h3>
              <p className="text-base font-bold text-neutral-600 md:text-[1.4cqw]">{p.t}</p>
              <ul className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 pl-4 text-sm text-neutral-800 md:mt-[0.4cqw] md:gap-x-[1.5cqw] md:gap-y-[0.3cqw] md:pl-[1.2cqw] md:text-[1.25cqw]">
                {p.items.map((it) => (
                  <li key={it} className="list-disc">{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )
  );

  // ---- SLIDE 06: WHY THIS MATTERS ----
  const whySlide = slide(
    "why",
    defaultImages.why,
    {
      point1: form.usp || "Unique value proposition",
      point2: form.whyNow || "Timing is critical",
      point3: form.audience || "Target audience is ready",
    },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-[#F8F9FA] px-6 py-12 md:gap-[2.5cqw] md:px-[5cqw] md:py-0">
          <h2 className={`${HEAD} w-full text-center text-4xl md:text-[7cqw]`}>WHY THIS MATTERS</h2>
          <div className="grid w-full grid-cols-1 gap-6 text-center md:grid-cols-3 md:gap-[3cqw]">
            {["point1", "point2", "point3"].map((key) => (
              <p key={key} className="px-2 text-base font-bold text-neutral-900 md:px-[1.5cqw] md:text-[1.4cqw]">
                <EditableText
                  value={slide.texts[key]}
                  onChange={(v) => updateText(key, v)}
                  as="p"
                  className="text-inherit"
                />
              </p>
            ))}
          </div>
        </div>
        <EditableImage
          src={slide.image}
          onChange={updateImage}
          className="h-[34vh] min-h-[34vh] w-full shrink-0 md:h-[34%] md:min-h-0"
        />
      </div>
    )
  );

  // ---- SLIDE 07: AUDIENCE PRIORITIZATION ----
  const audienceSlide = slide(
    "audience",
    defaultImages.audience,
    {
      primary: form.audience || "Young Adults (18–34)",
      geography: form.geography || "San Antonio",
    },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col items-center bg-[#F8F9FA] md:flex-row">
        <EditableImage
          src={slide.image}
          onChange={updateImage}
          className="h-[35vh] min-h-[35vh] w-full shrink-0 shadow-xl md:h-[84%] md:min-h-0 md:w-1/2 md:rounded-r-[3cqw]"
        />
        <div className="flex w-full flex-1 flex-col justify-center gap-6 px-6 py-12 md:w-1/2 md:gap-[2cqw] md:px-[4cqw] md:py-0">
          <h2 className={`${HEAD} text-center text-3xl md:text-left md:text-[4.8cqw]`}>
            AUDIENCE
            <br className="hidden md:block" /> PRIORITIZATION
          </h2>
          <div className="space-y-4 md:space-y-[1.4cqw]">
            <div>
              <h3 className="text-lg font-black text-neutral-900 md:text-[1.6cqw]">Primary Audience</h3>
              <p className="text-sm text-neutral-700 md:text-[1.3cqw]">
                <EditableText
                  value={slide.texts.primary}
                  onChange={(v) => updateText("primary", v)}
                  as="p"
                  className="text-inherit"
                />
              </p>
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900 md:text-[1.6cqw]">Geography</h3>
              <p className="text-sm text-neutral-700 md:text-[1.3cqw]">
                <EditableText
                  value={slide.texts.geography}
                  onChange={(v) => updateText("geography", v)}
                  as="p"
                  className="text-inherit"
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // ---- SLIDE 08: CUSTOMER FLOW JOURNEY ----
  const flowSlide = slide(
    "flow",
    defaultImages.flowLeft,
    {
      steps: 'Step 1: Consumer searches: "STD testing near me"\nStep 2: Discovers The Lab Cafe\nStep 3: Books Appointment\nStep 4: Receives Information\nStep 5: Returns For Additional Services',
    },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col bg-neutral-900 md:flex-row">
        <EditableImage
          src={slide.image}
          onChange={updateImage}
          className="hidden w-1/4 shrink-0 opacity-40 md:block"
        />
        <div className="z-10 flex w-full flex-1 flex-col justify-center bg-[#F8F9FA] px-6 py-12 shadow-2xl md:w-2/4 md:px-[4cqw] md:py-0">
          <h2 className={`${HEAD} mb-8 text-center text-4xl md:mb-[3cqw] md:text-right md:text-[5.5cqw]`}>
            CUSTOMER
            <br />
            FLOW
            <br />
            JOURNEY
          </h2>
          <div className="space-y-4 text-center text-base md:space-y-[1.4cqw] md:text-right md:text-[1.5cqw]">
            <EditableText
              value={slide.texts.steps}
              onChange={(v) => updateText("steps", v)}
              as="p"
              className="whitespace-pre-wrap"
            />
          </div>
        </div>
        <EditableImage
          src={slide.image}
          onChange={updateImage}
          className="hidden w-1/4 shrink-0 opacity-60 md:block"
        />
      </div>
    )
  );

  // ---- SLIDE 09: SUCCESS STORIES ----
  const successSlide = slide(
    "success",
    defaultImages.success,
    {
      title: form.objective || "Success Story",
      challenge: form.whyNow || "Market need",
      solution: form.usp || "Unique approach",
      outcome: "Measurable reach and ecosystem participation that transformed awareness into action",
    },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col bg-[#F8F9FA] md:flex-row">
        <EditableImage
          src={slide.image}
          onChange={updateImage}
          className="h-[40vh] min-h-[40vh] w-full shrink-0 md:h-full md:min-h-0 md:w-1/2"
        />
        <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 md:w-1/2 md:px-[4cqw] md:py-0">
          <h2 className={`${HEAD} mb-4 text-4xl md:mb-[1.4cqw] md:text-[6.5cqw]`}>
            SUCCESS
            <br />
            STORIES
          </h2>
          <p className="mb-4 inline-block self-start border-b-2 border-neutral-900 pb-1 text-base font-bold text-neutral-800 md:mb-[1.6cqw] md:pb-[0.3cqw] md:text-[1.5cqw]">
            <EditableText
              value={slide.texts.title}
              onChange={(v) => updateText("title", v)}
              as="p"
              className="text-inherit"
            />
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-800 md:space-y-[0.8cqw] md:pl-[1.4cqw] md:text-[1.25cqw]">
            <li>969K+ Views</li>
            <li>403K+ Accounts Reached</li>
            <li>1,600+ Participants Engaged</li>
            <li>
              <span className="font-bold">Challenge:</span>{" "}
              <EditableText
                value={slide.texts.challenge}
                onChange={(v) => updateText("challenge", v)}
                as="span"
                className="inline-block"
              />
            </li>
            <li>
              <span className="font-bold">Solution:</span>{" "}
              <EditableText
                value={slide.texts.solution}
                onChange={(v) => updateText("solution", v)}
                as="span"
                className="inline-block"
              />
            </li>
            <li>
              <span className="font-bold">Outcome:</span>{" "}
              <EditableText
                value={slide.texts.outcome}
                onChange={(v) => updateText("outcome", v)}
                as="span"
                className="inline-block"
              />
            </li>
          </ul>
        </div>
      </div>
    )
  );

  // ---- SLIDE 10: WHAT SUCCESS LOOKS LIKE ----
  const metricsSlide = slide(
    "metrics",
    defaultImages.metrics,
    {
      budget: form.budget || "Under $5k",
      channels: form.channels.join(", ") || "Search, Social, Email",
    },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col-reverse items-center bg-[#F8F9FA] md:flex-row">
        <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 md:w-3/5 md:px-[4cqw] md:pr-[3cqw] md:py-0">
          <h2 className={`${HEAD} mb-6 text-center text-4xl md:mb-[2.5cqw] md:text-left md:text-[5.5cqw]`}>
            WHAT
            <br />
            SUCCESS
            <br />
            LOOKS LIKE
          </h2>
          <div className="grid grid-cols-1 gap-6 text-sm text-neutral-800 sm:grid-cols-2 md:gap-[2cqw] md:text-[1.3cqw]">
            {[
              ["Marketing Metrics", ["Website Traffic", "Lead Volume", "Cost Per Lead", "Cost Per Appointment"]],
              ["Business Metrics", ["Customer Acquisition Cost (CAC)", "Revenue Per Customer", "Lifetime Value (LTV)", "Repeat Visit Rate"]],
              ["Executive Metrics", ["Market Expansion Readiness", "Channel ROI", "Growth Efficiency"]],
            ].map(([h, items]) => (
              <div key={h as string}>
                <h3 className="mb-2 inline-block border-b-2 border-neutral-900 pb-1 font-bold text-neutral-900 md:mb-[0.6cqw] md:pb-[0.2cqw]">
                  {h as string}
                </h3>
                <ul className="list-disc space-y-1 pl-5 md:space-y-[0.3cqw] md:pl-[1.4cqw]">
                  {(items as string[]).map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <EditableImage
          src={slide.image}
          onChange={updateImage}
          className="h-[40vh] min-h-[40vh] w-full shrink-0 shadow-2xl md:h-[80%] md:min-h-0 md:w-2/5"
        />
      </div>
    )
  );

  // ---- SLIDE 11: RECOMMENDED ENGAGEMENT ----
  const engagementSlide = slide(
    "engagement",
    defaultImages.engagement,
    {
      channels: form.channels.join(", ") || "Search, Social, Email",
    },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col bg-[#F8F9FA] md:flex-row">
        <EditableImage
          src={slide.image}
          onChange={updateImage}
          className="h-[40vh] min-h-[40vh] w-full shrink-0 md:h-full md:min-h-0 md:w-1/2"
        />
        <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 md:w-1/2 md:px-[4cqw] md:py-0">
          <h2 className={`${HEAD} mb-6 text-4xl md:mb-[2.5cqw] md:text-[5cqw]`}>
            RECOMMENDED
            <br />
            ENGAGEMENT
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 md:gap-x-[2.5cqw] md:gap-y-[2cqw]">
            {[
              ["Strategy", ["Market Research", "Audience Development", "Growth Planning"]],
              ["Acquisition", ["Media Buying", "SEO", "Content Development"]],
              ["Optimization", ["Analytics", "Testing", "Conversion Improvements"]],
            ].map(([h, items]) => (
              <div key={h as string}>
                <h3 className="mb-2 inline-block border-b-2 border-neutral-900 pb-1 text-lg font-black text-neutral-900 md:mb-[0.6cqw] md:pb-[0.2cqw] md:text-[1.6cqw]">
                  {h as string}
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700 marker:text-neutral-900 md:space-y-[0.4cqw] md:pl-[1.4cqw] md:text-[1.25cqw]">
                  {(items as string[]).map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );

  // ---- SLIDE 12: NEXT STEPS ----
  const nextStepsSlide = slide(
    "nextsteps",
    defaultImages.engagement,
    {
      closing: form.notes || "The objective is to build a scalable consumer healthcare brand powered by information, trust, and access.",
      competitor: form.competitors || "Other players",
    },
    ({ slide, updateText, updateImage }) => (
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-white px-6 py-12 md:flex-row md:px-[4cqw] md:py-0">
        <div className="flex w-full flex-col justify-center md:w-2/5 md:pr-[2cqw]">
          <h2 className={`${HEAD} mb-8 text-center text-4xl md:mb-[2.5cqw] md:text-left md:text-[6cqw]`}>NEXT STEPS</h2>
          <div className="flex aspect-[4/3] w-full max-w-[300px] self-center items-end justify-center rounded-2xl bg-neutral-50 shadow-inner md:max-w-none md:rounded-[2cqw]">
            <div className="flex h-full items-end justify-center gap-2 pb-6 md:gap-[1cqw] md:pb-[3cqw]">
              {["h-[18%]", "h-[34%]", "h-[52%]", "h-[70%]", "h-[88%]"].map((h, i) => (
                <div
                  key={i}
                  className={`w-3 md:w-[3cqw] ${h} shadow-md`}
                  style={{ background: `hsl(0 0% ${60 - i * 12}%)` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 flex w-full flex-col items-center justify-center text-center md:mt-0 md:w-3/5">
          <div className="flex w-full flex-col items-center space-y-4 md:space-y-[0.6cqw]">
            {[
              ["Discovery Alignment", "Finalize goals and KPIs"],
              ["Launch Phase 1", "Demand Capture Campaigns"],
              ["Measure & Optimize", "Validate CAC and Conversion Rates"],
              ["Scale Into New Markets", "Florida · Additional Texas Markets · National Expansion"],
            ].map(([h, p], i, arr) => (
              <div key={h} className="flex flex-col items-center">
                <h3 className="text-lg font-bold text-neutral-900 md:text-[1.6cqw]">{h}</h3>
                <p className="text-sm text-neutral-600 md:text-[1.25cqw]">{p}</p>
                {i < arr.length - 1 && (
                  <span className="my-2 text-xl font-bold text-neutral-400 md:my-[0.3cqw] md:text-[1.5cqw]">↓</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 flex w-full max-w-[80vw] flex-col items-center border-t-2 border-neutral-900 pt-6 md:mt-[2.5cqw] md:max-w-[50cqw] md:pt-[1.6cqw]">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500 md:mb-[0.5cqw] md:text-[1.1cqw]">
              Closing Statement
            </p>
            <p className="text-lg font-bold text-neutral-900 md:text-[1.5cqw]">
              The objective is not simply to generate tests.
            </p>
            <p className="mt-2 text-base font-medium leading-relaxed text-neutral-900 md:mt-[0.5cqw] md:text-[1.4cqw]">
              <EditableText
                value={slide.texts.closing}
                onChange={(v) => updateText("closing", v)}
                as="p"
                className="text-inherit"
              />
            </p>
          </div>
        </div>
      </div>
    )
  );

  return [
    titleSlide,
    heardSlide,
    opportunitySlide,
    strategySlide,
    planSlide,
    whySlide,
    audienceSlide,
    flowSlide,
    successSlide,
    metricsSlide,
    engagementSlide,
    nextStepsSlide,
  ];
}

/* ------------------------------------------------------------------ */
/*  Helper: Waveform                                                  */
/* ------------------------------------------------------------------ */

function Waveform() {
  const bars = Array.from({ length: 90 });
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
      preserveAspectRatio="none"
      viewBox="0 0 900 300"
      aria-hidden
    >
      {bars.map((_, i) => {
        const h = 20 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.3)) * 240;
        return <rect key={i} x={i * 10} y={(300 - h) / 2} width={4} height={h} fill="#111" />;
      })}
    </svg>
  );
}