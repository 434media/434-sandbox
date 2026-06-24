"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

/* =================================================================== */
/*  Images — swap these for your own (e.g. "/slides/opportunity.jpg"   */
/*  dropped into /public). Any that fail to load fall back to a clean   */
/*  grayscale panel, so the layout always renders.                      */
/* =================================================================== */

const IMAGES = {
  title: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
  opportunity: "https://images.unsplash.com/photo-1551076805-e18690c5e561?q=80&w=2070&auto=format&fit=crop",
  plan: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop",
  why: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop",
  audience: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop",
  flowLeft: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
  flowRight: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
  success: "https://images.unsplash.com/photo-1576091160550-2173ff9e5eb3?q=80&w=2070&auto=format&fit=crop",
  metrics: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2070&auto=format&fit=crop",
  engagement: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop",
};

/* =================================================================== */
/*  Reusable bits                                                      */
/* =================================================================== */

function Photo({ src, className = "" }: { src?: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-neutral-300 ${className}`}>
      {src && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover grayscale"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(135deg, #d4d4d4 0 14px, #c8c8c8 14px 28px)",
          }}
        />
      )}
    </div>
  );
}

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

const HEAD = "font-ggx88 font-black uppercase tracking-tighter leading-[0.85] text-neutral-900";

/* =================================================================== */
/*  Slides                                                             */
/* =================================================================== */

const slides: { id: string; node: ReactNode }[] = [
  /* 01 — TITLE -------------------------------------------------------- */
  {
    id: "01-title",
    node: (
      <div className="flex min-h-full w-full flex-col md:flex-row">
        <Photo src={IMAGES.title} className="h-[40vh] min-h-[40vh] w-full shrink-0 md:h-full md:min-h-0 md:w-1/2" />
        <div className="flex w-full flex-1 flex-col items-center justify-center bg-white px-6 py-12 md:w-1/2 md:px-[3cqw] md:py-0">
          <h1 className={`${HEAD} w-full text-center text-6xl md:text-[8cqw]`}>
            THE LAB
            <br />
            CAFE
          </h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-neutral-900 md:mt-[2.5cqw] md:text-[1.3cqw]">
            Presented By : 434 Media
          </p>
        </div>
      </div>
    ),
  },

  /* 02 — WHAT WE HEARD ----------------------------------------------- */
  {
    id: "02-what-we-heard",
    node: (
      <div className="relative flex min-h-full w-full flex-col items-center justify-center bg-[#F8F9FA] px-6 py-12 md:px-[5cqw] md:py-0">
        <Waveform />
        <h2 className={`${HEAD} relative z-10 w-full text-center text-4xl md:text-[7cqw]`}>WHAT WE HEARD</h2>
        <div className="relative z-10 mt-8 grid w-full grid-cols-1 gap-8 md:mt-[3cqw] md:grid-cols-3 md:gap-[3cqw]">
          {[
            {
              h: "Current Challenges",
              items: [
                "Heavy reliance on paid search",
                "Limited awareness outside existing demand channels",
                "Need for scalable customer acquisition",
              ],
            },
            {
              h: "Current Opportunities",
              items: [
                "Growing consumer demand for direct-access healthcare",
                "Strong operation and expertise",
                "Ability to scale rapidly into additional markets",
              ],
            },
            {
              h: "Desired Outcomes",
              items: [
                "Increase booked appointments",
                "Reduce customer acquisition cost",
                "Build sustainable brand awareness",
                "Create repeatable growth systems",
              ],
            },
          ].map((col) => (
            <div key={col.h} className="space-y-3 md:space-y-[1.4cqw]">
              <h3 className="inline-block border-b-2 border-neutral-900 pb-1 text-lg font-bold text-neutral-900 md:pb-[0.3cqw] md:text-[1.7cqw]">
                {col.h}
              </h3>
              <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-800 md:space-y-[0.8cqw] md:pl-[1.4cqw] md:text-[1.3cqw]">
                {col.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  /* 03 — OPPORTUNITY -------------------------------------------------- */
  {
    id: "03-opportunity",
    node: (
      <div className="flex min-h-full w-full flex-col-reverse bg-white md:flex-row">
        <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 md:w-1/2 md:px-[4cqw] md:py-0">
          <h2 className={`${HEAD} mb-4 text-4xl md:mb-[2.5cqw] md:text-[5.5cqw]`}>OPPORTUNITY</h2>
          <h3 className="mb-4 text-lg font-bold leading-snug text-neutral-900 md:mb-[2cqw] md:text-[1.6cqw]">
            THE LAB CAFE IS NOT COMPETING IN THE TESTING INDUSTRY. IT IS CREATING A CONSUMER
            HEALTHCARE ACCESS PLATFORM.
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-xs font-bold uppercase leading-relaxed tracking-wider text-neutral-800 md:space-y-[0.9cqw] md:pl-[1.4cqw] md:text-[1.1cqw]">
            <li>Consumers increasingly expect healthcare on demand</li>
            <li>Health information is becoming consumer controlled</li>
            <li>Privacy and convenience continue to drive adoption</li>
            <li>The Lab Cafe can become a trusted destination for health decision-making</li>
          </ul>
        </div>
        <Photo src={IMAGES.opportunity} className="h-[40vh] min-h-[40vh] w-full shrink-0 md:h-full md:min-h-0 md:w-1/2" />
      </div>
    ),
  },

  /* 04 — STRATEGIC RECOMMENDATION ------------------------------------- */
  {
    id: "04-recommendation",
    node: (
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-white px-6 py-12 md:flex-row md:px-[4cqw] md:py-0">
        <div className="flex w-full flex-col justify-center text-center md:w-3/5 md:pr-[3cqw] md:text-left">
          <h2 className={`${HEAD} mb-4 text-4xl md:mb-[2.5cqw] md:text-[5.5cqw]`}>
            STRATEGIC
            <br className="hidden md:block" /> RECOMMENDATION
          </h2>
          <div className="space-y-4 text-base font-medium text-neutral-800 md:space-y-[1.6cqw] md:text-[1.5cqw]">
            <p>Acquire consumers actively seeking answers.</p>
            <p>Building trust through education on relevant health content.</p>
            <p>
              Curate repeat customers through ongoing health engagement in order to retain
              established trust.
            </p>
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
    ),
  },

  /* 05 — RECOMMENDED MARKETING PLAN ----------------------------------- */
  {
    id: "05-marketing-plan",
    node: (
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-white py-12 md:flex-row md:py-0">
        <div className="mb-8 flex w-full flex-col justify-center px-6 text-center md:mb-0 md:h-full md:w-[44%] md:px-[4cqw] md:text-left">
          <h2 className={`${HEAD} text-4xl md:text-[5.5cqw]`}>
            RECOMMENDED
            <br className="hidden md:block" /> MARKETING
            <br className="hidden md:block" /> PLAN
          </h2>
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
    ),
  },

  /* 06 — WHY THIS MATTERS --------------------------------------------- */
  {
    id: "06-why-it-matters",
    node: (
      <div className="flex min-h-full w-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-[#F8F9FA] px-6 py-12 md:gap-[2.5cqw] md:px-[5cqw] md:py-0">
          <h2 className={`${HEAD} w-full text-center text-4xl md:text-[7cqw]`}>WHY THIS MATTERS</h2>
          <div className="grid w-full grid-cols-1 gap-6 text-center md:grid-cols-3 md:gap-[3cqw]">
            {[
              "Nearly 50% of STI cases occur among individuals aged 15–24.",
              "Millions of consumers seek health information online before engaging healthcare providers.",
              "Convenience, speed, privacy, and direct access continue to influence healthcare purchasing decisions.",
            ].map((t) => (
              <p key={t} className="px-2 text-base font-bold text-neutral-900 md:px-[1.5cqw] md:text-[1.4cqw]">
                {t}
              </p>
            ))}
          </div>
        </div>
        <Photo src={IMAGES.why} className="h-[34vh] min-h-[34vh] w-full shrink-0 md:h-[34%] md:min-h-0" />
      </div>
    ),
  },

  /* 07 — AUDIENCE PRIORITIZATION -------------------------------------- */
  {
    id: "07-audience",
    node: (
      <div className="flex min-h-full w-full flex-col items-center bg-[#F8F9FA] md:flex-row">
        <Photo
          src={IMAGES.audience}
          className="h-[35vh] min-h-[35vh] w-full shrink-0 shadow-xl md:h-[84%] md:min-h-0 md:w-1/2 md:rounded-r-[3cqw]"
        />
        <div className="flex w-full flex-1 flex-col justify-center gap-6 px-6 py-12 md:w-1/2 md:gap-[2cqw] md:px-[4cqw] md:py-0">
          <h2 className={`${HEAD} text-center text-3xl md:text-left md:text-[4.8cqw]`}>
            AUDIENCE
            <br className="hidden md:block" /> PRIORITIZATION
          </h2>
          <div className="space-y-4 md:space-y-[1.4cqw]">
            {[
              ["Primary Audience", "Young Adults (18–34) — largest volume opportunity."],
              ["Secondary Audience", "Women (20–34) — family planning, fertility, routine health."],
              ["Behavioral Audience", "Dating App Users — high intent and active decision-making."],
              ["Growth Audience", "LGBTQ+ Community — routine screening and proactive health management."],
            ].map(([h, p]) => (
              <div key={h}>
                <h3 className="text-lg font-black text-neutral-900 md:text-[1.6cqw]">{h}</h3>
                <p className="text-sm text-neutral-700 md:text-[1.3cqw]">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  /* 08 — CUSTOMER FLOW JOURNEY ---------------------------------------- */
  {
    id: "08-flow",
    node: (
      <div className="flex min-h-full w-full flex-col bg-neutral-900 md:flex-row">
        <Photo src={IMAGES.flowLeft} className="hidden w-1/4 shrink-0 opacity-40 md:block" />
        <div className="z-10 flex w-full flex-1 flex-col justify-center bg-[#F8F9FA] px-6 py-12 shadow-2xl md:w-2/4 md:px-[4cqw] md:py-0">
          <h2 className={`${HEAD} mb-8 text-center text-4xl md:mb-[3cqw] md:text-right md:text-[5.5cqw]`}>
            CUSTOMER
            <br />
            FLOW
            <br />
            JOURNEY
          </h2>
          <div className="space-y-4 text-center text-base md:space-y-[1.4cqw] md:text-right md:text-[1.5cqw]">
            {[
              'Consumer searches: "STD testing near me"',
              "Discovers The Lab Cafe",
              "Books Appointment",
              "Receives Information",
              "Returns For Additional Services",
            ].map((t, i) => (
              <div key={i}>
                <span className="font-bold text-neutral-900">Step {i + 1}</span>
                <br />
                <span className="text-neutral-700">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <Photo src={IMAGES.flowRight} className="hidden w-1/4 shrink-0 opacity-60 md:block" />
      </div>
    ),
  },

  /* 09 — SUCCESS STORIES ---------------------------------------------- */
  {
    id: "09-success",
    node: (
      <div className="flex min-h-full w-full flex-col bg-[#F8F9FA] md:flex-row">
        <Photo src={IMAGES.success} className="h-[40vh] min-h-[40vh] w-full shrink-0 md:h-full md:min-h-0 md:w-1/2" />
        <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 md:w-1/2 md:px-[4cqw] md:py-0">
          <h2 className={`${HEAD} mb-4 text-4xl md:mb-[1.4cqw] md:text-[6.5cqw]`}>
            SUCCESS
            <br />
            STORIES
          </h2>
          <p className="mb-4 inline-block self-start border-b-2 border-neutral-900 pb-1 text-base font-bold text-neutral-800 md:mb-[1.6cqw] md:pb-[0.3cqw] md:text-[1.5cqw]">
            Methodist Healthcare Ministries + VelocityTX
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-800 md:space-y-[0.8cqw] md:pl-[1.4cqw] md:text-[1.25cqw]">
            <li>969K+ Views</li>
            <li>403K+ Accounts Reached</li>
            <li>1,600+ Participants Engaged</li>
            <li>
              <span className="font-bold">Challenge:</span> Increase awareness and engagement around
              Social Determinants of Health across South Texas
            </li>
            <li>
              <span className="font-bold">Solution:</span> Community-focused awareness campaign
              combining content, events, education, and storytelling
            </li>
            <li>
              <span className="font-bold">Outcome:</span> Measurable reach and ecosystem
              participation that transformed awareness into action
            </li>
          </ul>
        </div>
      </div>
    ),
  },

  /* 10 — WHAT SUCCESS LOOKS LIKE -------------------------------------- */
  {
    id: "10-success-metrics",
    node: (
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
        <Photo
          src={IMAGES.metrics}
          className="h-[40vh] min-h-[40vh] w-full shrink-0 shadow-2xl md:h-[80%] md:min-h-0 md:w-2/5"
        />
      </div>
    ),
  },

  /* 11 — RECOMMENDED ENGAGEMENT --------------------------------------- */
  {
    id: "11-recommended-engagement",
    node: (
      <div className="flex min-h-full w-full flex-col bg-[#F8F9FA] md:flex-row">
        <Photo src={IMAGES.engagement} className="h-[40vh] min-h-[40vh] w-full shrink-0 md:h-full md:min-h-0 md:w-1/2" />
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
    ),
  },

  /* 12 — NEXT STEPS --------------------------------------------------- */
  {
    id: "12-next-steps",
    node: (
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
              The objective is to build a scalable consumer healthcare brand powered by information,
              trust, and access.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

/* =================================================================== */
/*  Presentation shell                                                  */
/* =================================================================== */

export default function PitchDeckPage() {
  const [[current, dir], setState] = useState<[number, number]>([0, 0]);

  const paginate = useCallback((d: number) => {
    setState(([c]) => {
      const n = c + d;
      if (n < 0 || n >= slides.length) return [c, d];
      return [n, d];
    });
  }, []);

  const goTo = useCallback((i: number) => setState(([c]) => [i, i > c ? 1 : -1]), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        paginate(1);
      }
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paginate]);

  const variants = {
    enter: (d: number) => ({ x: d >= 0 ? 80 : -80, opacity: 0, scale: 0.98 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
    exit: (d: number) => ({ x: d >= 0 ? -80 : 80, opacity: 0, scale: 0.98, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } }),
  };

  return (
    <section className="fixed inset-0 z-[9999] flex flex-col bg-neutral-950 font-geist-sans text-white">
      {/* STAGE */}
      <div className="flex flex-1 items-center justify-center bg-neutral-900 md:bg-transparent md:p-4">
        {/* Maximum viewing area container. Vertical scrolling fallback for mobile, fixed scale for Desktop */}
        <div className="@container relative h-full w-full overflow-hidden bg-white shadow-2xl md:aspect-video md:h-auto md:max-w-[min(100vw,calc((100vh-4rem)*16/9))] md:rounded-lg md:ring-1 md:ring-white/10">
          <AnimatePresence initial={false} custom={dir} mode="wait">
            <motion.div
              key={current}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 overflow-y-auto overflow-x-hidden md:overflow-hidden"
            >
              {slides[current].node}
            </motion.div>
          </AnimatePresence>

          {/* Click zones - Desktop only to not interfere with mobile scrolling */}
          <button
            aria-label="Previous slide"
            onClick={() => paginate(-1)}
            disabled={current === 0}
            className="absolute bottom-0 left-0 top-0 hidden w-[12%] cursor-w-resize disabled:cursor-default md:block"
          />
          <button
            aria-label="Next slide"
            onClick={() => paginate(1)}
            disabled={current === slides.length - 1}
            className="absolute bottom-0 right-0 top-0 hidden w-[12%] cursor-e-resize disabled:cursor-default md:block"
          />
        </div>
      </div>

      {/* COMBINED CONTROLS / HEADER */}
      <footer className="flex h-16 shrink-0 items-center justify-between border-t border-neutral-900 bg-neutral-950 px-4 md:px-6">
        <div className="w-20 font-geist-mono text-xs text-neutral-400">
          <span className="font-bold text-white">{String(current + 1).padStart(2, "0")}</span> /{" "}
          {String(slides.length).padStart(2, "0")}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => paginate(-1)}
            disabled={current === 0}
            className="rounded-full border border-neutral-700 px-3 py-1.5 text-sm transition-colors hover:bg-white hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            ←
          </button>
          <div className="hidden items-center gap-1.5 sm:flex">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-6 bg-white" : "w-1.5 bg-neutral-600 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => paginate(1)}
            disabled={current === slides.length - 1}
            className="rounded-full border border-neutral-700 px-3 py-1.5 text-sm transition-colors hover:bg-white hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            →
          </button>
        </div>

        <div className="hidden w-20 flex-col text-right sm:flex">
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            434 Media
          </p>
        </div>
      </footer>
    </section>
  );
}
