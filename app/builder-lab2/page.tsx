"use client";

import { Play } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

const internVideoSrc = "/videos/robert-vargas-intern.mov";

const profileRows = [
  { label: "School", value: "Saint Mary's University" },
  { label: "Class", value: "2026" },
  { label: "Studying", value: "Communications" },
  { label: "Team", value: "Underwriter Team" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function InternStoryPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-[#7890ff]/30">
      <ContourBackdrop />

      <section className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 pb-14 pt-12 sm:px-8 lg:px-12 lg:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mx-auto max-w-6xl text-center"
        >
          <div className="mb-7 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
            434 Media
          </div>
          <h1 className="bg-gradient-to-r from-[#526cff] via-[#9b91ff] to-[#ffd7ea] bg-clip-text text-[64px] font-medium leading-[0.88] tracking-[-0.055em] text-transparent sm:text-[108px] lg:text-[150px]">
            The Story
          </h1>
          <p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-white/38 sm:text-2xl">
            A closer look at the people learning, creating, and growing with 434 Media
          </p>
        </motion.div>

        <div className="relative mx-auto mt-20 grid w-full max-w-[1260px] items-center gap-4 lg:mt-24 lg:grid-cols-[420px_120px_minmax(0,1fr)] lg:gap-0">
          <InternProfileCard />
          <StoryThread />
          <VideoOutputCard />
        </div>
      </section>
    </main>
  );
}

function ContourBackdrop() {
  const paths = [
    "M-20 20 C50 -40 100 82 170 22 S285 -5 345 48 465 18 560 36 640 20 765 2 850 64 980 24 1090 -18 1220 32 1350 10 1500 34 1640 0",
    "M-20 100 C54 28 108 150 180 90 S302 62 360 116 476 86 556 102 648 86 760 72 858 132 984 92 1110 56 1218 104 1344 76 1494 100 1640 64",
    "M-20 180 C56 104 108 228 180 168 S304 142 362 196 478 166 560 182 648 166 760 152 858 212 984 172 1112 136 1220 184 1346 156 1496 180 1640 144",
    "M-20 260 C58 184 110 306 182 248 S306 222 364 276 480 246 562 262 650 246 762 232 860 292 986 252 1114 216 1222 264 1348 236 1498 260 1640 224",
    "M-20 340 C60 264 112 386 184 328 S308 302 366 356 482 326 564 342 652 326 764 312 862 372 988 332 1116 296 1224 344 1350 316 1500 340 1640 304",
    "M-20 420 C62 344 114 466 186 408 S310 382 368 436 484 406 566 422 654 406 766 392 864 452 990 412 1118 376 1226 424 1352 396 1502 420 1640 384",
    "M-20 500 C64 424 116 546 188 488 S312 462 370 516 486 486 568 502 656 486 768 472 866 532 992 492 1120 456 1228 504 1354 476 1504 500 1640 464",
    "M-20 580 C66 504 118 626 190 568 S314 542 372 596 488 566 570 582 658 566 770 552 868 612 994 572 1122 536 1230 584 1356 556 1506 580 1640 544",
    "M-20 660 C68 584 120 706 192 648 S316 622 374 676 490 646 572 662 660 646 772 632 870 692 996 652 1124 616 1232 664 1358 636 1508 660 1640 624",
    "M-20 740 C70 664 122 786 194 728 S318 702 376 756 492 726 574 742 662 726 774 712 872 772 998 732 1126 696 1234 744 1360 716 1510 740 1640 704",
    "M-20 820 C72 744 124 866 196 808 S320 782 378 836 494 806 576 822 664 806 776 792 874 852 1000 812 1128 776 1236 824 1362 796 1512 820 1640 784",
    "M-20 900 C74 824 126 946 198 888 S322 862 380 916 496 886 578 902 666 886 778 872 876 932 1002 892 1130 856 1238 904 1364 876 1514 900 1640 864",
  ];

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#010101]">
      <svg className="absolute inset-0 h-full w-full opacity-[0.28]" viewBox="0 0 1640 920" preserveAspectRatio="none">
        <g fill="none" stroke="rgba(255,255,255,.24)" strokeWidth="2">
          {paths.map((path) => (
            <path key={path} d={path} />
          ))}
        </g>
      </svg>
      <div className="absolute inset-x-8 top-6 h-px bg-white/10" />
      <div className="absolute inset-x-8 bottom-10 h-px bg-white/[0.08]" />
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.08]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] bg-[size:96px_96px] opacity-35 [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,.28)_50%,rgba(0,0,0,.9)_100%)]" />
    </div>
  );
}

function InternProfileCard() {
  return (
    <motion.article
      initial={{ opacity: 0, x: -28, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease }}
      className="relative z-10 overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#202023]/94 shadow-[0_30px_90px_rgba(0,0,0,.58)] backdrop-blur-2xl"
    >
      <div className="absolute -right-2 top-7 flex flex-col gap-3">
        <span className="h-5 w-5 rounded-full bg-[#78c252] shadow-[0_0_18px_rgba(120,194,82,.55)]" />
        <span className="h-5 w-5 rounded-full bg-[#8062ff] shadow-[0_0_18px_rgba(128,98,255,.55)]" />
        <span className="h-5 w-5 rounded-full border-4 border-[#ffe179] bg-black shadow-[0_0_18px_rgba(255,225,121,.45)]" />
      </div>
      <div className="px-5 pt-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="font-geist-mono text-[10px] uppercase tracking-[.18em] text-white/38">Intern story</p>
          <p className="truncate font-geist-mono text-[10px] text-white/38">Robert Vargas</p>
        </div>
        <div className="rounded-t-[14px] border border-white/[0.07] border-b-transparent bg-[#242427] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
          <p className="text-[22px] font-semibold leading-[1.05] tracking-[-0.035em] text-white/90">
            Robert Vargas
          </p>
          <p className="mt-4 text-sm leading-5 text-white/54">
            A Saint Mary's University communications student bringing curiosity, field notes, and story-first thinking to the Underwriter Team.
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

      <div className="mt-0 border-t border-white/[0.08] bg-[#2b2b2f] px-5 py-4">
        <p className="min-w-0 text-sm font-medium leading-5 text-white/58">Learning the craft through people, places, and real work</p>
      </div>
    </motion.article>
  );
}

function StoryThread() {
  return (
    <div className="relative z-20 flex h-20 items-center justify-center lg:h-[300px]">
      <svg viewBox="0 0 110 300" className="absolute hidden h-full w-full overflow-visible lg:block" aria-hidden>
        <path d="M0 150 C42 150 30 260 72 260 C106 260 82 150 110 150" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
        <motion.path
          d="M0 150 C42 150 30 260 72 260 C106 260 82 150 110 150"
          fill="none"
          stroke="url(#builder-lab2-story-thread-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.25, delay: 0.75, ease }}
        />
        <defs>
          <linearGradient id="builder-lab2-story-thread-gradient"><stop stopColor="#ffe179" /><stop offset=".52" stopColor="#ffe179" /><stop offset="1" stopColor="#8062ff" /></linearGradient>
        </defs>
      </svg>
      <div className="absolute h-px w-full bg-gradient-to-r from-[#ffe179]/70 via-[#ffe179]/70 to-[#8062ff]/70 lg:hidden" />
      {["bg-[#ffe179]", "bg-[#78c252]", "bg-[#8062ff]"].map((color, index) => (
        <motion.span
          key={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.05 + index * 0.2, type: "spring" }}
          className={`absolute h-3 w-3 rounded-full ${color} shadow-[0_0_14px_currentColor] ${index === 0 ? "left-[15%] lg:left-[5%] lg:top-[47%]" : index === 1 ? "left-1/2 lg:top-[64%]" : "right-[15%] lg:right-[3%] lg:top-[47%]"}`}
        />
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.3, type: "spring" }}
        className="relative h-9 w-9 rounded-full border border-[#ffe179] bg-black shadow-[0_0_24px_rgba(255,225,121,.18)]"
      />
    </div>
  );
}

function VideoOutputCard() {
  return (
    <motion.article
      initial={{ opacity: 0, x: 28, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: 0.65, ease }}
      className="relative z-10 overflow-hidden rounded-[18px] border border-white/[0.14] bg-[#222225]/95 shadow-[0_30px_110px_rgba(0,0,0,.66)] backdrop-blur-2xl"
    >
      <div className="absolute -right-10 top-8 h-6 w-6 rounded-full bg-[#8062ff] shadow-[0_0_28px_rgba(128,98,255,.8)]" />
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7, ease }}
          className="overflow-hidden rounded-t-[17px] bg-black"
        >
          <div className="relative aspect-video min-h-[300px] overflow-hidden bg-[linear-gradient(135deg,#16161a,#070709_70%)] sm:min-h-[430px] lg:min-h-[390px]">
            <InternVideo />
          </div>
        </motion.div>
        <div className="flex items-center gap-3 border-t border-white/10 bg-[#252528] px-5 py-4">
          <p className="min-w-0 flex-1 rounded-lg bg-black/20 px-4 py-2.5 text-sm font-medium text-white/46">Robert Vargas: Intern Story</p>
          <button aria-label="Play Robert Vargas intern story" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/70 text-black transition hover:scale-105 hover:bg-white">
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
        className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.92] saturate-[1.04]"
        controls={hasStarted}
        muted
        playsInline
        preload="metadata"
        poster=""
        onPlay={() => setHasStarted(true)}
        onPause={() => setHasStarted(false)}
        aria-label="Robert Vargas intern spotlight video"
      >
        <source src={internVideoSrc} type="video/quicktime" />
        <source src={internVideoSrc} type="video/mp4" />
      </video>
      <div className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.2)_55%,rgba(0,0,0,.64))] transition-opacity duration-300 ${hasStarted ? "opacity-0" : "opacity-100"}`} />
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
