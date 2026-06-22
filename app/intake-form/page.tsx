// Discovery Intake Form — Builders deliverable. Starter shell inside the 434
// design system (navbar + footer come from the layout). Build the real form
// here. Full brief: docs/intake-form.md.
export default function IntakeFormPage() {
  return (
    <section className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
          Digital Canvas · Builders
        </p>
        <h1 className="font-ggx88 text-4xl sm:text-5xl text-neutral-900 mt-3">Discovery Intake Form</h1>
        <p className="mt-4 text-neutral-600 leading-relaxed max-w-prose">
          Build the new-business <strong>discovery intake form</strong> here — the front door of the
          434 Media sales funnel. The Client Success team fills it out about a prospect so 434 can
          draft an optimal v1.0 pitch. This page is a starter inside the shared shell; replace it
          with your real form.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-neutral-600 list-disc pl-5">
          <li>Model the questions on the reference form (linked in the brief) — swap any agency framing to <strong>434 Media</strong>.</li>
          <li>This is <strong>phase 1</strong> of a funnel: form → <strong>lead</strong> workflow → <strong>outbound</strong> (email drip). Build the form first; shape the data so leads hang off it cleanly.</li>
          <li>Visuals &amp; copy tone are owned by <strong>Content</strong> — get their design direction before locking the look.</li>
          <li><strong>Sandbox, not production.</strong> Do <strong>not</strong> wire it to real/live endpoints — mock the submit.</li>
        </ul>
        <p className="mt-6 text-sm text-neutral-500">
          Full brief: <code className="text-neutral-700">docs/intake-form.md</code>
        </p>
      </div>
    </section>
  )
}
