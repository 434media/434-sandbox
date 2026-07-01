"use client";

import { useState, useRef, type ReactNode, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { ScrambleText } from "@/components/ScrambleText";
import {
  buildSlides,
  type Slide,
  type SlideData,
} from "@/lib/deck-generator/slides";

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
  }, [currentSlideIndex, slides.length]); // eslint-disable-line react-hooks/exhaustive-deps

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

    const generated = buildSlides(formToSlideData(form));
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
      updated[slideIdx] = { ...updated[slideIdx], texts: { ...updated[slideIdx].texts, [key]: val } };
      return updated;
    });
  };

  const updateSlideImage = (slideIdx: number, val: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[slideIdx] = { ...updated[slideIdx], image: val };
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
/*  Form → SlideData adapter                                          */
/* ------------------------------------------------------------------ */

function formToSlideData(form: FormState): SlideData[] {
  const channels = form.channels.join(", ") || "Search, Social, Email";
  return [
    {
      id: "title", image: "",
      texts: {
        company: form.objective || "Your Company",
        subtitle: "Presented By : 434 Media",
      },
    },
    {
      id: "heard", image: "",
      texts: {
        challenge: "Heavy reliance on paid search\nLimited awareness outside existing demand channels\nNeed for scalable customer acquisition",
        opportunity: "Growing consumer demand in your market\nStrong operation and expertise — a solid foundation\nAbility to scale rapidly into additional markets",
        outcome: "Increase booked conversions — drive revenue\nReduce customer acquisition cost — improve efficiency\nBuild sustainable brand awareness — become the go-to\nCreate repeatable growth systems — scale with confidence",
      },
    },
    {
      id: "opportunity", image: "",
      texts: {
        headline: `${form.objective} – ${form.geography || "Target Market"}`,
        bullets: `• Consumers expect increasingly on-demand solutions\n• Information is becoming consumer-controlled\n• Privacy and convenience continue to drive adoption\n• ${form.objective} can become a trusted destination`,
      },
    },
    {
      id: "strategy", image: "",
      texts: {
        line1: "Acquire consumers actively seeking answers.",
        line2: "Building trust through education on relevant content.",
        line3: "Curate repeat customers through ongoing engagement in order to retain established trust.",
      },
    },
    {
      id: "plan", image: "",
      texts: {
        channels,
        budget: form.budget || "Under $5k",
        geography: form.geography || "",
        audience: form.audience || "",
      },
    },
    {
      id: "why", image: "",
      texts: {
        point1: form.usp || "Unique value proposition that resonates.",
        point2: form.whyNow || "Timing is critical – and we're ready.",
        point3: form.audience ? `${form.audience} is engaged and ready to convert.` : "Target audience is engaged and waiting.",
      },
    },
    {
      id: "audience", image: "",
      texts: {
        primary: form.audience || "Young Adults (18–34)",
        geography: form.geography || "San Antonio",
      },
    },
    {
      id: "flow", image: "",
      texts: {
        steps: `Awareness\nSearch Intent\nWebsite Visit\nLead Form\nConsultation\nCustomer\nReferral`,
      },
    },
    {
      id: "success", image: "",
      texts: {
        title: `Success Story: ${form.objective || "Client Growth"} — Results Delivered`,
        challenge: form.whyNow || "Client faced stagnant results and rising acquisition costs.",
        solution: form.usp || "Deployed an integrated, audience-first media strategy across key channels.",
        outcome: "Measurable reach and ecosystem participation that transformed awareness into action.",
      },
    },
    {
      id: "metrics", image: "",
      texts: {
        kpi1: "Cost Per Lead",
        kpi2: "Return on Ad Spend",
        kpi3: "Brand Search Lift",
        budget: form.budget || "Under $5k",
        channels,
      },
    },
    {
      id: "engagement", image: "",
      texts: {
        strategy: "• Market Research & Audience Development\n• Growth Planning & Brand Strategy\n• Competitive Intelligence",
        acquisition: `• ${form.channels.length ? form.channels.join("\n• ") : "Paid Search\n• Paid Social\n• Display"}`,
        optimization: "• Analytics & A/B Testing\n• Conversion Rate Optimization\n• Real-Time Reporting\n• Budget Pacing",
      },
    },
    {
      id: "nextsteps", image: "",
      texts: {
        step1: "Kick-off call to align on goals, timeline, and creative direction.",
        step2: "Full media plan and strategy brief delivered within 5 business days.",
        step3: "Campaign launch with live reporting dashboard and weekly check-ins.",
        closing: form.notes && form.notes !== "Any additional context"
          ? form.notes
          : "The objective is to build a scalable, data-driven media strategy that drives real results.",
      },
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  AI Enhancement function (mock – replace with real API)            */
/* ------------------------------------------------------------------ */

async function enhanceWithAI(form: FormState, slides: Slide[]): Promise<Slide[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return slides.map((slide) => {
    const texts = { ...slide.texts };
    if (slide.id === "title" && texts.company) {
      texts.company = `🚀 ${form.objective || "Your Company"} – Unleashing Growth in ${form.geography || "your market"}`;
    } else if (slide.id === "heard") {
      texts.challenge = `• Heavy reliance on paid search — limiting organic growth.\n• Limited awareness outside existing demand channels — untapped potential.\n• Need for scalable customer acquisition — we have the solution.`;
      texts.opportunity = `• Growing consumer demand for direct-access solutions — the market is ready.\n• Strong operation and expertise — a solid foundation.\n• Ability to scale rapidly into additional markets — the time is now.`;
      texts.outcome = `• Increase booked appointments — drive revenue.\n• Reduce customer acquisition cost — improve efficiency.\n• Build sustainable brand awareness — become the go-to.\n• Create repeatable growth systems — scale with confidence.`;
    } else if (slide.id === "opportunity") {
      texts.headline = `${form.objective} – Not just a goal, a movement.`;
      texts.bullets = `• Consumers increasingly expect solutions on demand — we deliver.\n• Information is becoming consumer controlled — we empower.\n• Privacy and convenience continue to drive adoption — we lead.\n• ${form.objective} can become a trusted destination — we build trust.`;
    } else if (slide.id === "strategy") {
      texts.line1 = `Acquire consumers actively seeking answers — using ${form.channels.join(", ")}.`;
      texts.line2 = `Build trust through education on relevant content — informed decisions.`;
      texts.line3 = `Curate repeat customers through ongoing engagement — loyalty that lasts.`;
    } else if (slide.id === "plan") {
      texts.channels = form.channels.join(", ") || "Search, Social, Email";
    } else if (slide.id === "why") {
      texts.point1 = form.usp || "Unique value proposition that resonates.";
      texts.point2 = form.whyNow || "Timing is critical – and we're ready.";
      texts.point3 = form.audience || "Target audience is engaged and waiting.";
    } else if (slide.id === "audience") {
      texts.primary = form.audience || "Young Adults (18–34) – high demand.";
      texts.geography = form.geography || "San Antonio – the perfect testbed.";
    } else if (slide.id === "success") {
      texts.title = `${form.objective} Success Story`;
      texts.challenge = form.whyNow || "Market need identified.";
      texts.solution = form.usp || "Our unique approach delivered results.";
      texts.outcome = "Measurable reach and ecosystem participation that transformed awareness into action.";
    } else if (slide.id === "metrics") {
      texts.budget = form.budget || "Under $5k";
      texts.channels = form.channels.join(", ") || "Search, Social, Email";
    } else if (slide.id === "nextsteps") {
      texts.closing = form.notes || "The objective is to build a scalable consumer brand powered by information, trust, and access.";
    }
    return { ...slide, texts };
  });
}
