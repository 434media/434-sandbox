"use client"

import { ArrowUpRight } from "lucide-react"

// SANDBOX STUB — a static, non-functional newsletter form. The production
// version posts to /api/newsletter; here it's visual only so the footer's
// layout stays intact. Wire it to a real endpoint if/when you need it.
export function Newsletter() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center gap-2"
      aria-label="Newsletter signup (disabled in sandbox)"
    >
      <input
        type="email"
        placeholder="you@example.com"
        className="flex-1 min-w-0 bg-white/5 border border-white/15 rounded-md px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/40"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-md bg-white text-neutral-950 px-3 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors shrink-0"
      >
        Subscribe <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </form>
  )
}
