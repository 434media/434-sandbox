"use client";

import { useState, useRef, type ReactNode } from "react";
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

const initialForm: FormState = {
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

const requiredFields: (keyof FormState)[] = [
  "objective",
  "whyNow",
  "geography",
  "audience",
  "channels",
  "budget",
];

/* ------------------------------------------------------------------ */
/*  Motion                                                            */
/* ------------------------------------------------------------------ */

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07 },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ */
/*  Primitives                                                        */
/* ------------------------------------------------------------------ */

const baseField =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-neutral-900 placeholder-neutral-400 " +
  "transition-colors outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

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
    <motion.label variants={fieldVariants} className="block">
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
    </motion.label>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-3xl border border-neutral-200 p-8 shadow-sm"
    >
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-geist-mono text-xs text-neutral-400">{index}</span>
        <h2 className="font-ggx88 text-3xl">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function IntakeFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Set<keyof FormState>>(new Set());
  const formTopRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof FormState>(name: K, value: FormState[K]) => {
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
    console.log("SANDBOX SUBMISSION", form);
    setSubmitted(true);
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const err = (k: keyof FormState) => errors.has(k);
  const field = (k: keyof FormState) =>
    baseField + (err(k) ? " border-red-500" : " border-neutral-300");

  return (
    <section className="min-h-screen bg-white px-6 pt-28 pb-24">
      <div ref={formTopRef} className="mx-auto max-w-3xl">
        {/* HEADER */}
        <p className="font-geist-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
          434 Media · Client Success Tool
        </p>
        <h1 className="mt-4 font-ggx88 text-5xl md:text-7xl">
          <ScrambleText text="Discovery Intake" scrambleOnMount duration={28} />
        </h1>
        <p className="mt-6 max-w-2xl leading-relaxed text-neutral-600">
          Internal sales-funnel tool for capturing prospect context and generating a v1.0 pitch
          strategy.
        </p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 rounded-3xl bg-neutral-900 p-12 text-white"
            >
              <p className="font-geist-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
                Submitted
              </p>
              <h2 className="mt-4 font-ggx88 text-5xl">
                <ScrambleText text="Thank You" scrambleOnMount duration={30} />
              </h2>
              <p className="mt-6 max-w-xl leading-relaxed text-neutral-300">
                Your discovery intake has been received. The 434 Media team will review the details
                and follow up with next steps shortly.
              </p>
              {/* "Submit another" button removed per request */}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-12 space-y-6"
            >
              {/* 01 — THE OPPORTUNITY */}
              <Section index="01" title="The Opportunity">
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
                              onClick={() => update("objective", o)}
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
                        onChange={(e) => update("whyNow", e.target.value)}
                      />
                    </FieldShell>
                  </div>
                  <div data-field="geography">
                    <FieldShell label="Target Geography" required error={err("geography")}>
                      <input
                        className={field("geography")}
                        placeholder="San Antonio, South Texas…"
                        value={form.geography}
                        onChange={(e) => update("geography", e.target.value)}
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
                        onChange={(e) => update("audience", e.target.value)}
                      />
                    </FieldShell>
                  </div>
                </div>
              </Section>

              {/* 02 — MEDIA PLAN INPUTS */}
              <Section index="02" title="Media Plan Inputs">
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
                            onClick={() => update("budget", b)}
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
              </Section>

              {/* 03 — SHARPEN THE PITCH */}
              <Section index="03" title="Sharpen the Pitch">
                <div className="space-y-5">
                  <FieldShell label="Competitors">
                    <textarea
                      rows={3}
                      className={baseField + " border-neutral-300"}
                      placeholder="Who else is in the conversation?"
                      value={form.competitors}
                      onChange={(e) => update("competitors", e.target.value)}
                    />
                  </FieldShell>
                  <FieldShell label="Unique Selling Proposition">
                    <textarea
                      rows={3}
                      className={baseField + " border-neutral-300"}
                      placeholder="What makes them different?"
                      value={form.usp}
                      onChange={(e) => update("usp", e.target.value)}
                    />
                  </FieldShell>
                  <FieldShell label="Notes">
                    <textarea
                      rows={4}
                      className={baseField + " border-neutral-300"}
                      placeholder="Anything else worth capturing"
                      value={form.notes}
                      onChange={(e) => update("notes", e.target.value)}
                    />
                  </FieldShell>
                </div>
              </Section>

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
                  Submit Intake
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}