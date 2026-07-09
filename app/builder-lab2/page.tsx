"use client";

import { ArrowRight, Check, Play, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

const internVideoSrc = "/videos/robert-vargas-intern.mov";

const profileRows = [
  { label: "School", value: "Saint Mary's University" },
  { label: "Class", value: "2026" },
  { label: "Studying", value: "Communications" },
  { label: "Team", value: "Underwriter Team" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function BuilderLab2Page() {
  const [buildStage, setBuildStage] = useState(4);
  const flowRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const generateFlow = () => {
    setBuildStage(1);
    [2, 3, 4].forEach((stage, index) => window.setTimeout(() => setBuildStage(stage), reduceMotion ? 0 : 650 * (index + 1)));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-[#7890ff]/30">
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(115,107,255,.2),transparent_28%),radial-gradient(circle_at_78%_50%,rgba(214,153,255,.12),transparent_32%),linear-gradient(180deg,#020203_0%,#050506_58%,#000_100%)]" />
        <div className="absolute inset-x-8 top-6 h-px bg-white/10" />
        <div className="absolute inset-x-8 bottom-10 h-px bg-white/[0.08]" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.08]" />
        <div className="absolute inset-0 opacity-[0.42] [background-image:repeating-radial-gradient(ellipse_at_50%_45%,transparent_0_42px,rgba(255,255,255,.16)_43px,transparent_45px)] [background-size:210px_118px] [background-position:center_-12px] [mask-image:linear-gradient(to_bottom,black_0%,black_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] bg-[size:96px_96px] opacity-35 [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,.18)_42%,rgba(0,0,0,.86)_100%)]" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-[1500px] flex-col px-5 pb-16 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mx-auto max-w-6xl text-center"
        >
          <div className="mb-7 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
            434 Media
          </div>
          <h1 className="bg-gradient-to-r from-[#526cff] via-[#9b91ff] to-[#ffd7ea] bg-clip-text text-[56px] font-medium leading-[0.9] tracking-[-0.075em] text-transparent sm:text-[96px] lg:text-[138px]">
            The Story
          </h1>
          <p className="mx-auto mt-7 max-w-4xl text-lg leading-7 text-white/42 sm:text-2xl">
            
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#09090b] shadow-[0_8px_30px_rgba(255,255,255,.12)]"
            onClick={() => flowRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" })}
          >
            Start Building
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </motion.button>
        </motion.div>

        <div ref={flowRef} className="relative mx-auto mt-20 grid w-full max-w-[1160px] scroll-mt-24 items-center gap-4 lg:mt-24 lg:grid-cols-[430px_110px_1fr] lg:gap-0">
          <InternProfileCard buildStage={buildStage} onGenerate={generateFlow} />
          <FlowConnector buildStage={buildStage} />
          <VideoOutputCard buildStage={buildStage} />
        </div>
      </section>
    </main>
  );
}

function InternProfileCard({ buildStage, onGenerate }: { buildStage: number; onGenerate: () => void }) {
  return (
    <motion.article
      initial={{ opacity: 0, x: -28, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease }}
      className="relative z-10 overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#202023]/92 shadow-[0_30px_90px_rgba(0,0,0,.55)] backdrop-blur-2xl"
    >
      <div className="absolute -right-2 top-7 flex flex-col gap-3">
        <span className="h-5 w-5 rounded-full bg-[#78c252] shadow-[0_0_18px_rgba(120,194,82,.55)]" />
        <span className="h-5 w-5 rounded-full bg-[#8062ff] shadow-[0_0_18px_rgba(128,98,255,.55)]" />
        <span className="h-5 w-5 rounded-full border-4 border-[#ffe179] bg-black shadow-[0_0_18px_rgba(255,225,121,.45)]" />
      </div>
      <div className="px-5 pt-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="font-geist-mono text-[10px] text-white/38">GPT 5.2</p>
          <p className="truncate font-geist-mono text-[10px] text-white/38">Robert Vargas intern profile</p>
        </div>
        <div className="rounded-t-[14px] border border-white/[0.07] border-b-transparent bg-[#242427] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
          <p className="text-[17px] font-semibold leading-[1.15] tracking-[-0.02em] text-white/88">
            Create an intern spotlight for Robert Vargas at Saint Mary's University.
          </p>
          <p className="mt-4 text-sm leading-5 text-white/54">
            Communications major, Class of 2026, supporting the Underwriter Team through profile storytelling, field notes, and share-ready media.
          </p>
        </div>
        <div className="rounded-b-[14px] border border-white/[0.07] bg-[#171719] px-5 py-4">
          {profileRows.map((row, index) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + index * 0.08 }}
              className="grid grid-cols-[88px_1fr] items-center gap-3 py-1.5 text-xs"
            >
              <span className="text-white/33">{row.label}</span>
              <span className="min-w-0 text-right text-white/70">{row.value}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-0 flex items-center gap-3 border-t border-white/[0.08] bg-[#2b2b2f] px-5 py-4">
        <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-white/58">write a profile reel for Robert Vargas</p>
        <button onClick={onGenerate} disabled={buildStage > 0 && buildStage < 4} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/75 text-black transition hover:scale-105 hover:bg-white disabled:cursor-wait disabled:bg-white/45">
          {buildStage === 4 ? <Play className="ml-0.5 h-4 w-4 fill-black" /> : <Sparkles className="h-4 w-4" />}
        </button>
      </div>
    </motion.article>
  );
}

function FlowConnector({ buildStage }: { buildStage: number }) {
  return (
    <div className="relative z-20 flex h-20 items-center justify-center lg:h-[300px]">
      <svg viewBox="0 0 110 300" className="absolute hidden h-full w-full overflow-visible lg:block" aria-hidden>
        <path d="M0 150 C42 150 30 260 72 260 C106 260 82 150 110 150" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
        <motion.path
          d="M0 150 C42 150 30 260 72 260 C106 260 82 150 110 150"
          fill="none"
          stroke="url(#builder-lab2-flow-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: buildStage > 0 ? 1 : 0.15 }}
          transition={{ duration: 1.25, delay: 0.75, ease }}
        />
        <defs>
          <linearGradient id="builder-lab2-flow-gradient"><stop stopColor="#ffe179" /><stop offset=".52" stopColor="#ffe179" /><stop offset="1" stopColor="#8062ff" /></linearGradient>
        </defs>
      </svg>
      <div className="absolute h-px w-full bg-gradient-to-r from-[#ffe179]/70 via-[#ffe179]/70 to-[#8062ff]/70 lg:hidden" />
      {["bg-[#ffe179]", "bg-[#78c252]", "bg-[#8062ff]"].map((color, index) => (
        <motion.span
          key={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: buildStage > index ? 1 : 0.45, opacity: buildStage > index ? 1 : 0.2 }}
          transition={{ delay: 1.05 + index * 0.2, type: "spring" }}
          className={`absolute h-3 w-3 rounded-full ${color} shadow-[0_0_14px_currentColor] ${index === 0 ? "left-[15%] lg:left-[5%] lg:top-[47%]" : index === 1 ? "left-1/2 lg:top-[64%]" : "right-[15%] lg:right-[3%] lg:top-[47%]"}`}
        />
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={buildStage > 0 && buildStage < 4 ? { scale: [1, 1.12, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={buildStage > 0 && buildStage < 4 ? { repeat: Infinity, duration: 1.2 } : { delay: 1.3, type: "spring" }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#ffe179] bg-black shadow-xl"
      >
        {buildStage === 4 ? <Check className="h-3.5 w-3.5 text-[#ffe179]" /> : <Play className="ml-0.5 h-3 w-3 fill-white text-white" />}
      </motion.div>
      <AnimatePresence mode="wait">
        {buildStage > 0 && buildStage < 4 && (
          <motion.span key={buildStage} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-0 whitespace-nowrap font-geist-mono text-[9px] uppercase tracking-[.16em] text-white/45 lg:top-[172px]">
            {["", "Profiling", "Packaging", "Assembling"][buildStage]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function VideoOutputCard({ buildStage }: { buildStage: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, x: 28, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: 0.65, ease }}
      className="relative z-10 overflow-hidden rounded-[18px] border border-white/[0.14] bg-[#222225]/95 shadow-[0_30px_100px_rgba(0,0,0,.62)] backdrop-blur-2xl"
    >
      <div className="absolute -right-10 top-8 h-6 w-6 rounded-full bg-[#8062ff] shadow-[0_0_28px_rgba(128,98,255,.8)]" />
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: buildStage === 4 ? 1 : 0.45, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7, ease }}
          className="overflow-hidden rounded-t-[17px] bg-black"
        >
          <div className="relative aspect-video min-h-[250px] overflow-hidden bg-[linear-gradient(135deg,#16161a,#070709_70%)] sm:min-h-[360px]">
            <InternVideo />
          </div>
        </motion.div>
        <div className="flex items-center gap-3 border-t border-white/10 bg-[#2b2b2f] px-5 py-4">
          <p className="min-w-0 flex-1 rounded-lg bg-black/18 px-4 py-2.5 text-sm font-medium text-white/46">Robert Vargas intern spotlight reel</p>
          <button aria-label="Play intern spotlight reel" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/75 text-black transition hover:scale-105 hover:bg-white">
            <Play className="ml-0.5 h-4 w-4 fill-black" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function InternVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const playVideo = () => {
    setHasStarted(true);
    videoRef.current?.play().catch(() => setHasStarted(false));
  };

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        controls={hasStarted}
        playsInline
        preload="metadata"
        onPlay={() => setHasStarted(true)}
        onPause={() => setHasStarted(false)}
        aria-label="Robert Vargas intern spotlight video"
      >
        <source src={internVideoSrc} type="video/quicktime" />
        <source src={internVideoSrc} type="video/mp4" />
      </video>
      <div className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72))] transition-opacity duration-300 ${hasStarted ? "opacity-0" : "opacity-100"}`} />
      {!hasStarted && (
        <>
          <button
            type="button"
            aria-label="Play Robert Vargas intern video"
            onClick={playVideo}
            className="absolute bottom-5 right-5 grid h-14 w-14 place-items-center rounded-full bg-white/75 text-black shadow-[0_0_34px_rgba(255,255,255,.18)] backdrop-blur-md transition hover:scale-105 hover:bg-white"
          >
            <Play className="ml-1 h-5 w-5 fill-black" />
          </button>
        </>
      )}
    </>
  );
}
