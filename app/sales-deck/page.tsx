// Sales Deck — Builders deliverable. Starter shell inside the 434 design system
// (navbar + footer come from the layout). Build the real web deck here.
// Full brief: docs/sales-deck.md.
export default function SalesDeckPage() {
  return (
    <section className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
          Digital Canvas · Builders
        </p>
        <h1 className="font-ggx88 text-4xl sm:text-5xl text-neutral-900 mt-3">Sales Deck</h1>
        <p className="mt-4 text-neutral-600 leading-relaxed max-w-prose">
          Build the web-based sales deck here — the 434 / Digital Canvas pitch as a page you can
          send with a link. Centered on the health vertical, with Lab Cafe as the customer example.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-neutral-600 list-disc pl-5">
          <li>Strong hook → clear arc (problem → approach → proof → call to action).</li>
          <li>On-brand type, color, imagery — coordinate assets with Storytellers.</li>
          <li>No production coupling — this can deploy on its own.</li>
        </ul>
        <p className="mt-6 text-sm text-neutral-500">
          Full brief: <code className="text-neutral-700">docs/sales-deck.md</code>
        </p>
      </div>
    </section>
  )
}
