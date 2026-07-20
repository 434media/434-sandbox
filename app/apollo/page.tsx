"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion"
import {
  ArrowDown, ArrowRight, BarChart3, BriefcaseBusiness, Building2, Check,
  CircleDollarSign, Crosshair, Database, Mail, MessageSquareText, MousePointer2,
  Radar, Search, Send, Sparkles, Target, TrendingUp, Users, Zap,
  type LucideIcon,
} from "lucide-react"

const blue = "#5B7CFA"

const benefits = [
  { n: "01", icon: Search, title: "Find the right leads", copy: "Advanced filters and AI-powered search surface the companies and contacts that match our ICP — no more manual list-building." },
  { n: "02", icon: Radar, title: "Act on intent signals", copy: "See who's hiring, raising funding, or growing fast, so we reach out exactly when a company is most likely to buy." },
  { n: "03", icon: Database, title: "One connected system", copy: "Lead discovery, company insights, contact data, and outreach live in one platform — outbound stays organized and efficient." },
]

const workflow = [
  { icon: Crosshair, title: "Identify your ICP", copy: "Define the firmographics, roles, and traits of the customers most likely to convert." },
  { icon: Search, title: "Save searches", copy: "Turn ICP filters into saved searches so new matching prospects surface automatically." },
  { icon: Radar, title: "Research contacts", copy: "Review company insights and intent signals to prioritize the highest-value contacts." },
  { icon: Mail, title: "Draft the email", copy: "Craft a personalized single email or 3-email sequence to open the conversation." },
]

const kpis = [
  { step: "01", label: "Lead → MQL", copy: "Leads that become marketing qualified based on defined criteria.", icon: Users },
  { step: "02", label: "MQL → SQL", copy: "Marketing qualified leads that become sales qualified.", icon: Target },
  { step: "03", label: "SQL → Discovery", copy: "Sales qualified leads that book an initial discovery call.", icon: MessageSquareText },
  { step: "04", label: "Discovery → Proposal", copy: "Discovery calls that progress to a proposal or live product demo.", icon: BriefcaseBusiness },
  { step: "05", label: "Proposal → Closed-Won", copy: "Proposals or demos that result in a signed contract or paying customer.", icon: Check },
  { step: "06", label: "Lead → Customer", copy: "The overall percentage of leads that ultimately become paying customers.", icon: CircleDollarSign },
]

const scoreboard = [
  { label: "Total Leads", note: "Volume entering the funnel", icon: Users },
  { label: "MQL Rate", note: "Quality of top-of-funnel", icon: TrendingUp },
  { label: "Sales Accepted", note: "SDR to AE handoff health", icon: Check },
  { label: "Meetings Booked", note: "New pipeline created", icon: MessageSquareText },
  { label: "Revenue Closed", note: "Bottom-line outcome", icon: CircleDollarSign },
]

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { once: true, margin: "-80px" })
  return <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 28 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: .75, delay, ease: [.22, 1, .36, 1] }}>{children}</motion.div>
}

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <div className={`mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.26em] ${dark ? "text-white/45" : "text-slate-400"}`}><span className="h-px w-8 bg-current" />{children}</div>
}

function IconBox({ icon: Icon, dark = false }: { icon: LucideIcon; dark?: boolean }) {
  return <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dark ? "bg-white/10 text-white" : "bg-[#eef2ff] text-[#4f6ee8]"}`}><Icon size={21} strokeWidth={1.8} /></div>
}

function Metric({ label, note, icon: Icon, i }: { label: string; note: string; icon: LucideIcon; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { once: true, margin: "-40px" })
  return <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * .08 }} className="group border-t border-white/10 py-6 md:py-8">
    <div className="flex items-start justify-between gap-4"><div><div className="mb-5 text-4xl font-semibold tracking-[-.05em] text-white/30">—</div><h3 className="text-base font-medium text-white">{label}</h3><p className="mt-1 text-sm text-white/45">{note}</p></div><Icon className="text-white/25 transition group-hover:text-[#8ca2ff]" size={22} /></div>
  </motion.div>
}

export default function ApolloPage() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })
  const heroY = useTransform(scrollYProgress, [0, .16], [0, 130])
  const [openKpi, setOpenKpi] = useState(0)

  useEffect(() => {
    document.body.classList.add("apollo-page")
    return () => document.body.classList.remove("apollo-page")
  }, [])

  return <div className="min-h-screen bg-[#f7f8fb] text-[#11131a] selection:bg-[#5b7cfa] selection:text-white">
    <motion.div className="fixed left-0 top-0 z-[100] h-[3px] origin-left bg-[#5b7cfa]" style={{ scaleX: progress, width: "100%" }} />

    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0b0d13]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8"><a href="#top" className="flex items-center gap-2.5 text-sm font-semibold text-white"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5b7cfa]"><Sparkles size={14} /></span>Apollo</a><div className="hidden items-center gap-7 text-xs text-white/55 md:flex"><a className="hover:text-white" href="#why">Why Apollo</a><a className="hover:text-white" href="#workflow">Workflow</a><a className="hover:text-white" href="#kpis">KPIs</a></div><a href="#scoreboard" className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#11131a] transition hover:scale-[1.03]">View scoreboard</a></div>
    </nav>

    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#0b0d13] px-5 pt-20 text-white md:px-8">
      <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 70% 35%, rgba(91,124,250,.24), transparent 34%), radial-gradient(circle at 20% 85%, rgba(109,220,255,.08), transparent 28%)" }} />
      <motion.div style={{ y: heroY }} className="absolute right-[-10%] top-[18%] h-[520px] w-[520px] rounded-full border border-white/10 md:right-[2%]"><div className="absolute inset-[15%] rounded-full border border-white/10"/><div className="absolute inset-[32%] rounded-full border border-[#5b7cfa]/35"/><motion.div animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }} className="absolute inset-0"><span className="absolute left-1/2 top-[-5px] h-2.5 w-2.5 rounded-full bg-[#8ca2ff] shadow-[0_0_28px_8px_rgba(91,124,250,.55)]" /></motion.div></motion.div>
      <div className="relative mx-auto grid w-full max-w-7xl gap-12 py-24 md:grid-cols-[1.2fr_.8fr] md:items-end">
        <div><Reveal><Eyebrow dark>Sales enablement · 434 Media</Eyebrow><h1 className="max-w-4xl text-[clamp(4rem,10vw,8.7rem)] font-semibold leading-[.83] tracking-[-.075em]">Build a more<br/><span className="text-[#8ca2ff]">predictable</span><br/>pipeline.</h1></Reveal></div>
        <Reveal delay={.18} className="max-w-md pb-2 md:justify-self-end"><p className="text-lg leading-relaxed text-white/60">Apollo connects prospecting, intent signals, contact intelligence, and outreach in one focused system.</p><a href="#why" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#5b7cfa] px-6 py-3.5 text-sm font-semibold transition hover:bg-[#6d89ff]">Explore the playbook <ArrowDown size={16}/></a></Reveal>
      </div>
    </section>

    <section id="why" className="px-5 py-28 md:px-8 md:py-40"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>The case for Apollo</Eyebrow><h2 className="max-w-4xl text-5xl font-semibold tracking-[-.055em] md:text-7xl">Focus the team on the right opportunity, at the right moment.</h2></Reveal><div className="mt-20 grid gap-px overflow-hidden rounded-[28px] border border-slate-200 bg-slate-200 md:grid-cols-3">{benefits.map((b,i)=><Reveal key={b.title} delay={i*.08} className="group bg-white p-8 transition duration-300 hover:-translate-y-1 md:p-10"><div className="flex items-center justify-between"><IconBox icon={b.icon}/><span className="text-xs text-slate-300">{b.n}</span></div><h3 className="mt-16 text-2xl font-semibold tracking-[-.035em]">{b.title}</h3><p className="mt-4 text-[15px] leading-relaxed text-slate-500">{b.copy}</p></Reveal>)}</div></div></section>

    <section id="workflow" className="overflow-hidden bg-white px-5 py-28 md:px-8 md:py-40"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>Step by step</Eyebrow><div className="grid gap-8 md:grid-cols-2 md:items-end"><h2 className="text-5xl font-semibold tracking-[-.055em] md:text-7xl">Prospecting is a system.</h2><p className="max-w-lg text-lg text-slate-500 md:justify-self-end">A repeatable flow turns one-off list building into a dependable source of qualified conversations.</p></div></Reveal><div className="relative mt-20 grid gap-6 md:grid-cols-4"><div className="absolute left-0 right-0 top-6 hidden h-px bg-slate-200 md:block"/>{workflow.map((w,i)=><Reveal key={w.title} delay={i*.1} className="relative"><div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-[#5b7cfa] shadow-sm">{i+1}</div><w.icon className="mt-12 text-[#5b7cfa]" size={23}/><h3 className="mt-5 text-xl font-semibold tracking-tight">{w.title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-500">{w.copy}</p></Reveal>)}</div></div></section>

    <section className="bg-[#11141c] px-5 py-28 text-white md:px-8 md:py-40"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow dark>From search to sale</Eyebrow><h2 className="max-w-3xl text-5xl font-semibold tracking-[-.055em] md:text-7xl">One connected pipeline.</h2></Reveal><div className="mt-20 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">{[
      {icon:Search,title:"Prospecting",copy:"Build targeted lists of contacts that match the ICP and are most likely to value the product."},
      {icon:Mail,title:"Inbox",copy:"Capture site intakes, track messages awaiting a response, and convert intakes to leads."},
      {icon:Users,title:"Leads",copy:"Keep prospecting and inbox leads ready for sequences and conversion."},
    ].map((p,i)=><div key={p.title} className="contents"><Reveal delay={i*.12} className="group min-h-72 rounded-[28px] border border-white/10 bg-white/[.045] p-8 transition hover:border-[#5b7cfa]/50 hover:bg-white/[.07]"><IconBox icon={p.icon} dark/><p className="mt-12 text-xs uppercase tracking-[.2em] text-white/35">0{i+1}</p><h3 className="mt-3 text-2xl font-semibold">{p.title}</h3><p className="mt-4 text-sm leading-relaxed text-white/50">{p.copy}</p></Reveal>{i<2&&<ArrowRight className="mx-auto hidden text-white/20 md:block"/>}</div>)}</div>
      <Reveal className="mt-28 rounded-[32px] bg-[#5b7cfa] p-8 md:p-12"><div className="grid gap-10 md:grid-cols-[.8fr_1.2fr]"><div><Eyebrow dark>How we sell</Eyebrow><h3 className="text-4xl font-semibold tracking-[-.045em] md:text-5xl">Prospect.<br/>Outreach.<br/>Convert.</h3></div><div className="grid gap-5 md:grid-cols-3">{[
        [MousePointer2,"Prospect","Apollo surfaces high-value clients who match the ICP."], [Send,"Outreach","A single email or a 3-email sequence opens communication authentically."], [Zap,"Convert","Meaningful conversation builds rapport, trust, and new client relationships."],
      ].map(([I,t,c],i)=>{const Icon=I as LucideIcon; return <div key={t as string} className="rounded-2xl bg-white/10 p-5"><Icon size={20}/><div className="mt-10 text-xs text-white/45">0{i+1}</div><h4 className="mt-2 font-semibold">{t as string}</h4><p className="mt-2 text-sm leading-relaxed text-white/60">{c as string}</p></div>})}</div></div></Reveal>
    </div></section>

    <section className="px-5 py-28 md:px-8 md:py-40"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>Strategic recommendation</Eyebrow><h2 className="max-w-3xl text-5xl font-semibold tracking-[-.055em] md:text-7xl">Keep the motion simple.</h2></Reveal><div className="mt-16 grid gap-6 md:grid-cols-3">{[
      [Building2,"Prospect / add lead","Add qualified prospects into the pipeline."], [Send,"Outreach","Engage with a single email or a 3-email sequence."], [CircleDollarSign,"Convert to client","Build trust and turn conversations into clients."],
    ].map(([I,t,c],i)=>{const Icon=I as LucideIcon;return <Reveal key={t as string} delay={i*.1} className="rounded-[26px] border border-slate-200 bg-white p-8 shadow-[0_20px_70px_rgba(23,31,55,.05)]"><IconBox icon={Icon}/><h3 className="mt-12 text-xl font-semibold">{t as string}</h3><p className="mt-3 text-sm text-slate-500">{c as string}</p></Reveal>})}</div><Reveal className="mt-16 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-6 text-xs font-semibold uppercase tracking-[.18em] text-slate-400">{["Acquire","Educate","Retain","Refer"].map((x,i)=><div key={x} className="flex items-center gap-4"><span>{x}</span>{i<3&&<ArrowRight className="hidden text-slate-300 sm:block" size={14}/>}</div>)}</Reveal></div></section>

    <section id="kpis" className="bg-white px-5 py-28 md:px-8 md:py-40"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>Funnel KPIs</Eyebrow><div className="grid gap-8 md:grid-cols-2 md:items-end"><h2 className="text-5xl font-semibold tracking-[-.055em] md:text-7xl">Measure every handoff.</h2><p className="max-w-md text-lg text-slate-500 md:justify-self-end">Track conversion at every stage to find where momentum builds—and where it breaks.</p></div></Reveal>
      <div className="mt-20 grid gap-8 md:grid-cols-[.9fr_1.1fr]"><Reveal className="relative overflow-hidden rounded-[30px] bg-[#11141c] p-8 text-white md:p-10"><p className="text-xs uppercase tracking-[.2em] text-white/40">Live conversion map</p><div className="mt-12 space-y-7">{["Leads","MQL","SQL","Discovery","Proposal","Closed-Won","Customer"].map((x,i)=><div key={x} className="relative"><div className="mb-2 flex justify-between text-sm"><span>{x}</span><span className="text-white/30">{i===0?"100%":"Set baseline"}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div initial={{width:0}} whileInView={{width:`${100-i*11}%`}} viewport={{once:true}} transition={{duration:1,delay:i*.08}} className="h-full rounded-full bg-gradient-to-r from-[#5b7cfa] to-[#94a7ff]"/></div></div>)}</div><p className="mt-10 text-xs leading-relaxed text-white/35">Conversion targets are intentionally left open until baseline data is available.</p></Reveal>
        <Reveal><div className="divide-y divide-slate-200 border-y border-slate-200">{kpis.map((k,i)=><button key={k.label} onClick={()=>setOpenKpi(i)} className="w-full py-5 text-left"><div className="flex items-center gap-4"><span className="text-xs text-slate-300">{k.step}</span><k.icon size={18} className={openKpi===i?"text-[#5b7cfa]":"text-slate-400"}/><span className="flex-1 font-semibold">{k.label}</span><motion.span animate={{rotate:openKpi===i?90:0}}><ArrowRight size={16} className="text-slate-300"/></motion.span></div>{openKpi===i&&<motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} className="pl-[68px] pt-3 text-sm leading-relaxed text-slate-500">{k.copy}</motion.p>}</button>)}</div></Reveal>
      </div></div></section>

    <section id="scoreboard" className="bg-[#0b0d13] px-5 py-28 text-white md:px-8 md:py-40"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow dark>Your scoreboard</Eyebrow><div className="grid gap-8 md:grid-cols-2 md:items-end"><h2 className="text-5xl font-semibold tracking-[-.055em] md:text-7xl">Track what moves revenue.</h2><p className="max-w-md text-lg text-white/45 md:justify-self-end">Responses, handoffs, meetings, and closed revenue turn prospecting activity into predictable pipeline.</p></div></Reveal><div className="mt-20 grid gap-x-8 md:grid-cols-5">{scoreboard.map((m,i)=><Metric key={m.label} {...m} i={i}/>)}</div><Reveal className="mt-20 flex flex-col gap-8 rounded-[30px] border border-white/10 bg-white/[.04] p-8 md:flex-row md:items-center md:justify-between md:p-12"><div><p className="text-2xl font-semibold tracking-tight">Consistency creates predictability.</p><p className="mt-2 text-sm text-white/45">Presented by 434 Media</p></div><a href="#top" className="inline-flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#11131a]">Back to top <ArrowDown className="rotate-180" size={15}/></a></Reveal></div></section>
  </div>
}
