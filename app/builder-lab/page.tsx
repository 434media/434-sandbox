"use client";

import { MeshGradient, DotOrbit } from "@paper-design/shaders-react";
import { ArrowRight, Check, Copy, ExternalLink, Layers3, Play, RotateCcw, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

const funnelSteps = [
  { name: "Awareness", detail: "Paid social + local reach", color: "#ffcd6b" },
  { name: "Lead Capture", detail: "Launch offer landing page", color: "#8ee8c1" },
  { name: "Proposal", detail: "Automated sales deck", color: "#8db8ff" },
  { name: "Conversion", detail: "CRM handoff + follow-up", color: "#c69cff" },
];

const deliverables = [
  { name: "Strategy", meta: "12 pages", color: "bg-[#ffcd6b]" },
  { name: "Deck", meta: "Ready to share", color: "bg-[#8db8ff]" },
  { name: "Launch", meta: "4 channels", color: "bg-[#c69cff]" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function BuilderLabPage() {
  const [buildStage, setBuildStage] = useState(0);
  const [activeOutput, setActiveOutput] = useState("Funnel");
  const [brief, setBrief] = useState({ audience: "Young professionals", goal: "Lead generation", budget: "$15k–$50k" });
  const flowRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const generateFlow = () => {
    setBuildStage(1);
    [2, 3, 4].forEach((stage, index) => window.setTimeout(() => setBuildStage(stage), reduceMotion ? 0 : 700 * (index + 1)));
  };

  const resetFlow = () => {
    setBuildStage(0);
    setActiveOutput("Funnel");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050506] text-white selection:bg-violet-400/30">
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <MeshGradient
          colors={["#050506", "#15102c", "#143246", "#351b48"]}
          distortion={0.65}
          swirl={0.35}
          speed={0.12}
          style={{ width: "100%", height: "100%" }}
        />
        <div className="absolute -right-[10%] top-[12%] h-[520px] w-[520px] opacity-[0.16] blur-[1px]">
          <DotOrbit
            colors={["#f6cc76", "#9be6c8", "#9bafff", "#d5a5ff"]}
            colorBack="#09080d"
            scale={0.32}
            speed={0.12}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,.45)_0%,rgba(5,5,6,.78)_58%,#050506_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1440px] flex-col px-5 pb-20 pt-24 sm:px-8 lg:px-12 lg:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 font-geist-mono text-[10px] uppercase tracking-[0.24em] text-white/60 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9be6c8] shadow-[0_0_12px_#9be6c8]" />
            434 Media
          </div>
          <h1 className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-5xl font-semibold tracking-[-0.06em] text-transparent sm:text-7xl lg:text-[88px]">
            Builder Flows
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
            Turn client ideas into automated sales funnels, decks, and campaign
            workflows in one creative system.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#09090b] shadow-[0_8px_30px_rgba(255,255,255,.12)]"
            onClick={() => flowRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" })}
          >
            Start Building
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </motion.button>
        </motion.div>

        <div ref={flowRef} className="relative mx-auto mt-16 grid w-full max-w-[1180px] scroll-mt-24 items-center gap-5 lg:mt-20 lg:grid-cols-[0.9fr_130px_1.15fr] lg:gap-0">
          <IntakeCard brief={brief} setBrief={setBrief} buildStage={buildStage} onGenerate={generateFlow} onReset={resetFlow} />
          <FlowConnector buildStage={buildStage} />
          <OutputCard buildStage={buildStage} activeOutput={activeOutput} setActiveOutput={setActiveOutput} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.8 }}
          className="mx-auto mt-12 flex items-center gap-3 font-geist-mono text-[10px] uppercase tracking-[0.2em] text-white/30"
        >
          <Layers3 className="h-3.5 w-3.5" />
          One intake. A complete campaign system.
        </motion.div>
      </section>
    </main>
  );
}

type Brief = { audience: string; goal: string; budget: string };

function IntakeCard({ brief, setBrief, buildStage, onGenerate, onReset }: {
  brief: Brief;
  setBrief: React.Dispatch<React.SetStateAction<Brief>>;
  buildStage: number;
  onGenerate: () => void;
  onReset: () => void;
}) {
  const fields: { label: string; key: keyof Brief }[] = [
    { label: "Audience", key: "audience" }, { label: "Goal", key: "goal" }, { label: "Budget", key: "budget" },
  ];
  return (
    <motion.article
      initial={{ opacity: 0, x: -28, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease }}
      className="relative z-10 overflow-hidden rounded-[26px] border border-white/[0.11] bg-[#0d0d10]/90 p-1 shadow-[0_30px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl"
    >
      <div className="rounded-[22px] border border-white/[0.05] bg-gradient-to-b from-white/[0.055] to-transparent p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcd6b]" />
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Client Intake</p>
          </div>
          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/35">{buildStage === 0 ? "Draft" : buildStage === 4 ? "Built" : "Processing"}</span>
        </div>

        <h2 className="mt-6 text-2xl font-medium tracking-[-0.035em]">Build a sales funnel</h2>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Create a full campaign strategy for a local coffee brand launching in San Antonio.
        </p>

        <div className="mt-7 space-y-2.5">
          {fields.map(({ label, key }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + index * 0.1 }}
              className="grid grid-cols-[78px_1fr] items-center rounded-xl border border-white/[0.07] bg-black/20 px-3.5 py-2.5 text-xs focus-within:border-white/20"
            >
              <span className="text-white/35">{label}</span>
              <input aria-label={label} value={brief[key]} disabled={buildStage > 0 && buildStage < 4} onChange={(event) => setBrief((current) => ({ ...current, [key]: event.target.value }))} className="min-w-0 bg-transparent text-right text-white/75 outline-none disabled:opacity-45" />
            </motion.div>
          ))}
        </div>

        <button onClick={buildStage === 4 ? onReset : onGenerate} disabled={buildStage > 0 && buildStage < 4} className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-semibold text-black transition-colors hover:bg-[#e8e8ed] disabled:cursor-wait disabled:bg-white/55">
          {buildStage === 4 ? <RotateCcw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          {buildStage === 0 ? "Generate Flow" : buildStage === 4 ? "Build Another" : "Building Flow…"}
          {buildStage === 0 && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
        </button>
      </div>
    </motion.article>
  );
}

function FlowConnector({ buildStage }: { buildStage: number }) {
  return (
    <div className="relative z-20 flex h-16 items-center justify-center lg:h-[250px]">
      <svg viewBox="0 0 130 250" className="absolute hidden h-full w-full overflow-visible lg:block" aria-hidden>
        <path d="M0 125 C42 125 31 75 65 75 C99 75 88 125 130 125" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
        <motion.path
          d="M0 125 C42 125 31 75 65 75 C99 75 88 125 130 125"
          fill="none"
          stroke="url(#flow-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: buildStage > 0 ? 1 : 0.15 }}
          transition={{ duration: 1.25, delay: 0.75, ease }}
        />
        <defs>
          <linearGradient id="flow-gradient"><stop stopColor="#ffcd6b" /><stop offset=".52" stopColor="#8ee8c1" /><stop offset="1" stopColor="#9bafff" /></linearGradient>
        </defs>
      </svg>
      <div className="absolute h-px w-full bg-gradient-to-r from-[#ffcd6b]/70 via-[#8ee8c1]/70 to-[#9bafff]/70 lg:hidden" />
      {["bg-[#ffcd6b]", "bg-[#8ee8c1]", "bg-[#9bafff]"].map((color, index) => (
        <motion.span
          key={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: buildStage > index ? 1 : 0.45, opacity: buildStage > index ? 1 : 0.2 }}
          transition={{ delay: 1.05 + index * 0.2, type: "spring" }}
          className={`absolute h-2.5 w-2.5 rounded-full ${color} shadow-[0_0_14px_currentColor] ${index === 0 ? "left-[15%] lg:left-[24%] lg:top-[45%]" : index === 1 ? "left-1/2 lg:top-[27%]" : "right-[15%] lg:right-[24%] lg:top-[45%]"}`}
        />
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={buildStage > 0 && buildStage < 4 ? { scale: [1, 1.12, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={buildStage > 0 && buildStage < 4 ? { repeat: Infinity, duration: 1.2 } : { delay: 1.3, type: "spring" }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#121217] shadow-xl"
      >
        {buildStage === 4 ? <Check className="h-3.5 w-3.5 text-[#8ee8c1]" /> : <Play className="ml-0.5 h-3 w-3 fill-white text-white" />}
      </motion.div>
      <AnimatePresence mode="wait">
        {buildStage > 0 && buildStage < 4 && (
          <motion.span key={buildStage} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-0 whitespace-nowrap font-geist-mono text-[9px] uppercase tracking-[.16em] text-white/45 lg:top-[172px]">
            {["", "Analyzing", "Planning", "Assembling"][buildStage]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function OutputCard({ buildStage, activeOutput, setActiveOutput }: { buildStage: number; activeOutput: string; setActiveOutput: (value: string) => void }) {
  const visibleSteps = buildStage === 4 ? 4 : Math.max(0, buildStage - 1);
  return (
    <motion.article
      initial={{ opacity: 0, x: 28, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: 0.65, ease }}
      className="relative z-10 overflow-hidden rounded-[26px] border border-white/[0.12] bg-[#0d0d10]/90 p-1 shadow-[0_30px_100px_rgba(0,0,0,.55)] backdrop-blur-2xl"
    >
      <div className="rounded-[22px] border border-white/[0.05] bg-gradient-to-b from-white/[0.06] to-transparent p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2"><span className={`absolute inline-flex h-full w-full rounded-full bg-[#8ee8c1] opacity-60 ${buildStage > 0 && buildStage < 4 ? "animate-ping" : ""}`} /><span className="relative h-2 w-2 rounded-full bg-[#8ee8c1]" /></span>
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Generated Output</p>
          </div>
          <span className="flex items-center gap-1 rounded-full border border-[#8ee8c1]/15 bg-[#8ee8c1]/[0.06] px-2 py-1 text-[10px] text-[#a7e7cb]">{buildStage === 4 && <Check className="h-2.5 w-2.5" />}{buildStage === 0 ? "Waiting" : buildStage === 4 ? "Complete" : `${Math.round((buildStage / 4) * 100)}%`}</span>
        </div>

        <div className="mt-5 flex gap-1 rounded-xl border border-white/[0.06] bg-black/20 p-1">
          {["Funnel", "Strategy", "Deck", "Launch"].map((tab) => <button key={tab} onClick={() => setActiveOutput(tab)} className={`flex-1 rounded-lg px-2 py-2 text-[10px] transition ${activeOutput === tab ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}>{tab}</button>)}
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div><p className="text-xs text-white/35">Campaign architecture</p><h2 className="mt-1.5 text-3xl font-medium tracking-[-0.04em]">{activeOutput === "Funnel" ? "Sales Funnel" : activeOutput}</h2></div>
          <span className="font-geist-mono text-[10px] text-white/25">{activeOutput === "Funnel" ? "04 STEPS" : "READY"}</span>
        </div>

        <div className="relative mt-6 space-y-2.5 before:absolute before:bottom-5 before:left-[17px] before:top-5 before:w-px before:bg-gradient-to-b before:from-[#ffcd6b]/40 before:via-[#8db8ff]/40 before:to-[#c69cff]/40">
          {funnelSteps.map((step, index) => (
            <motion.div
              key={step.name}
              initial={{ opacity: 0, x: 14 }}
              transition={{ delay: 1.05 + index * 0.13, ease }}
              animate={{ opacity: index < visibleSteps || buildStage === 0 ? (buildStage === 0 ? 0.28 : 1) : 0.16, x: 0 }}
              className="relative flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 p-3 transition-opacity"
            >
              <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#121216] font-geist-mono text-[10px]" style={{ color: step.color }}>{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1"><p className="text-xs font-medium text-white/85">{step.name}</p><p className="mt-0.5 truncate text-[11px] text-white/30">{step.detail}</p></div>
              {index < visibleSteps && <Check className="h-3.5 w-3.5 text-[#8ee8c1]/60" />}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {deliverables.map((item, index) => (
            <motion.div key={item.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.55 + index * 0.1 }} className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
              <span className={`mb-3 block h-1.5 w-1.5 rounded-full ${item.color}`} /><p className="text-[11px] font-medium text-white/70">{item.name}</p><p className="mt-1 text-[9px] text-white/25">{item.meta}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
          <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#ffcd6b] to-[#9bafff] text-[9px] font-bold text-black">434</span><div><p className="text-[10px] text-white/60">Built by 434 Studio</p><p className="text-[9px] text-white/25">Strategy · Design · Automation</p></div></div>
          <div className="flex gap-1"><button aria-label="Copy output" className="rounded-lg border border-white/[0.08] p-2 text-white/35 hover:text-white"><Copy className="h-3 w-3" /></button><button aria-label="Open output" className="rounded-lg border border-white/[0.08] p-2 text-white/35 hover:text-white"><ExternalLink className="h-3 w-3" /></button></div>
        </div>
      </div>
    </motion.article>
  );
}
