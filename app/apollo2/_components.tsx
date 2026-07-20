"use client"

import { motion, useInView } from "framer-motion"
import { useRef, type ReactNode } from "react"
import { ArrowRight, Check, CircleDollarSign, MessageSquare, Search, Send, Target, TrendingUp, Users, type LucideIcon } from "lucide-react"

const ease = [0.22, 1, 0.36, 1] as const

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1180px] px-6 md:px-10 ${className}`}>{children}</div>
}

export function ScrollReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { once: true, margin: "-12% 0px" })
  return <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 32 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: .85, delay, ease }}>{children}</motion.div>
}

export function SectionHeader({ kicker, title, copy, dark = false, center = true }: { kicker: string; title: ReactNode; copy?: string; dark?: boolean; center?: boolean }) {
  return <ScrollReveal className={center ? "mx-auto max-w-4xl text-center" : "max-w-3xl"}>
    <p className="mb-5 text-sm font-semibold text-[#147ce5]">{kicker}</p>
    <h2 className={`text-[clamp(2.8rem,6vw,5.8rem)] font-semibold leading-[.98] tracking-[-.065em] ${dark ? "text-white" : "text-[#1d1d1f]"}`}>{title}</h2>
    {copy && <p className={`mt-7 max-w-2xl text-lg leading-relaxed md:text-xl ${center ? "mx-auto" : ""} ${dark ? "text-white/55" : "text-[#6e6e73]"}`}>{copy}</p>}
  </ScrollReveal>
}

export function CTA({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <a href={href} className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-medium transition hover:scale-[1.02] ${secondary ? "border border-[#147ce5] text-[#147ce5]" : "bg-[#147ce5] text-white"}`}>{children}</a>
}

const heroStages = [
  [Search, "Identify", "Ideal clients"],
  [Target, "Qualify", "Fit + intent"],
  [Send, "Engage", "Personal outreach"],
  [MessageSquare, "Convert", "Real conversation"],
  [TrendingUp, "Grow", "Long-term value"],
] as const

export function HeroSystemVisual() {
  return <ScrollReveal className="mx-auto mt-16 w-full max-w-[1120px] px-6 pb-14 md:mt-20 md:px-10">
    <div className="relative overflow-hidden rounded-[32px] border border-black/[.07] bg-white p-5 shadow-[0_28px_90px_rgba(28,68,112,.10)] md:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-black/[.06] pb-5"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#86868b]">434 Media</p><p className="mt-1 text-sm font-semibold">Qualified lead system</p></div><div className="flex items-center gap-2 text-[11px] text-[#34a853]"><span className="h-2 w-2 rounded-full bg-[#34c759]"/>Operating</div></div>
      <div className="grid gap-3 md:grid-cols-5">{heroStages.map(([icon,title,detail],i)=>{const Icon=icon; return <motion.div key={title} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.12+i*.1,duration:.6,ease}} className="relative rounded-[20px] border border-black/[.06] bg-[#fafafa] p-5 text-left"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4ff] text-[#147ce5]"><Icon size={18}/></div><p className="mt-8 text-[10px] text-[#86868b]">0{i+1}</p><h3 className="mt-2 text-lg font-semibold tracking-[-.025em]">{title}</h3><p className="mt-1 text-xs text-[#6e6e73]">{detail}</p>{i<heroStages.length-1&&<div className="absolute -right-[13px] top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-black/[.08] bg-white text-[#147ce5] md:flex"><ArrowRight size={12}/></div>}</motion.div>})}</div>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]"><div className="rounded-2xl bg-[#f1f7ff] p-4"><div className="flex items-center gap-3"><div className="flex-1"><div className="flex justify-between text-[11px]"><span className="font-semibold text-[#147ce5]">System visibility</span><span className="text-[#86868b]">Every handoff measured</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#147ce5]/10"><motion.div initial={{width:0}} whileInView={{width:"100%"}} viewport={{once:true}} transition={{duration:1.5,delay:.4,ease}} className="h-full rounded-full bg-[#147ce5]"/></div></div></div></div><div className="flex items-center justify-center rounded-2xl bg-[#111216] px-6 py-4 text-xs font-semibold text-white">Predictable pipeline</div></div>
    </div>
  </ScrollReveal>
}

export function NarrativeSection({ index, title, copy }: { index: string; title: string; copy: string }) {
  return <ScrollReveal className="grid gap-6 border-t border-black/10 py-8 md:grid-cols-[80px_1fr_1.2fr] md:py-12"><span className="text-xs text-[#86868b]">{index}</span><h3 className="text-2xl font-semibold tracking-[-.035em]">{title}</h3><p className="text-[15px] leading-relaxed text-[#6e6e73]">{copy}</p></ScrollReveal>
}

const process = [
  [Target, "Ideal Client Profile", "Define the firmographics, roles, and traits of customers most likely to convert."],
  [Search, "Saved Searches", "Turn the ICP into repeatable filters so new matching prospects surface automatically."],
  [TrendingUp, "Research", "Use company context and intent signals to prioritize the highest-value contacts."],
  [Send, "Personalized Outreach", "Open the conversation with one thoughtful email or a focused three-email sequence."],
] as const

export function ProcessFlow() {
  return <div className="relative mt-20 grid gap-8 md:grid-cols-4"><div className="absolute left-[6%] right-[6%] top-6 hidden h-px bg-black/10 md:block"/>{process.map(([icon,title,copy],i)=>{const Icon=icon; return <ScrollReveal key={title} delay={i*.1} className="relative"><div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold text-[#147ce5]">{i+1}</div><Icon className="mt-10 text-[#147ce5]" size={21}/><h3 className="mt-5 text-xl font-semibold tracking-[-.025em]">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#6e6e73]">{copy}</p></ScrollReveal>})}</div>
}

const pipeline = ["Prospecting", "Inbox", "Qualified Lead", "Outreach", "Conversation", "Proposal", "Client", "Long-Term Relationship"]

export function PipelineVisualization() {
  return <ScrollReveal className="mt-20 rounded-[36px] border border-white/10 bg-white/[.045] p-7 md:p-12"><div className="grid gap-3 md:grid-cols-4">{pipeline.map((stage,i)=><motion.div key={stage} initial={{ opacity: .18 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-20%" }} transition={{ delay: i*.1, duration: .6 }} className="relative rounded-2xl border border-white/10 bg-white/[.045] p-5"><span className="text-[10px] text-white/25">0{i+1}</span><p className="mt-8 text-sm font-semibold text-white">{stage}</p>{i<pipeline.length-1&&<ArrowRight className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-[#2997ff] md:block" size={16}/>}</motion.div>)}</div><div className="mt-8 h-1 overflow-hidden rounded bg-white/10"><motion.div initial={{width:0}} whileInView={{width:"100%"}} viewport={{once:true}} transition={{duration:2,ease}} className="h-full bg-[#147ce5]"/></div></ScrollReveal>
}

const metrics = [[Users,"Total Leads","Volume entering the funnel"],[TrendingUp,"MQL Rate","Top-of-funnel quality"],[Check,"Sales Accepted","SDR-to-AE handoff health"],[MessageSquare,"Meetings Booked","New pipeline created"],[CircleDollarSign,"Revenue Closed","Bottom-line outcome"]] as const

export function StatisticCard({ icon: Icon, label, note, index }: { icon: LucideIcon; label: string; note: string; index: number }) {
  return <ScrollReveal delay={index*.06} className="rounded-[22px] border border-black/[.06] bg-white p-6 shadow-[0_18px_50px_rgba(20,32,56,.05)]"><div className="flex items-center justify-between"><Icon size={18} className="text-[#147ce5]"/><span className="rounded-full bg-[#eef6ff] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#147ce5]">Baseline</span></div><div className="mt-9 text-4xl font-semibold text-black/25">—</div><h3 className="mt-5 text-sm font-semibold">{label}</h3><p className="mt-1 text-xs text-[#86868b]">{note}</p></ScrollReveal>
}

export function KPIGrid() { return <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{metrics.map(([icon,label,note],i)=><StatisticCard key={label} icon={icon} label={label} note={note} index={i}/>)}</div> }

export function ExecutiveDashboard() {
  return <ScrollReveal className="mt-5 overflow-hidden rounded-[30px] bg-[#111216] p-7 text-white md:p-10"><div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between"><div><p className="text-xs text-white/35">Operating rhythm</p><h3 className="mt-2 text-2xl font-semibold">Responses across every sequence</h3><p className="mt-2 text-sm text-white/40">Track consistently. Improve deliberately.</p></div><div className="flex h-28 items-end gap-2">{[28,45,38,61,53,73,68,91,80,100].map((height,i)=><motion.span key={i} initial={{height:0}} whileInView={{height:`${height}%`}} viewport={{once:true}} transition={{delay:i*.05,duration:.7}} className="w-4 rounded-t bg-gradient-to-t from-[#147ce5] to-[#64b5ff]"/>)}</div></div></ScrollReveal>
}
