// Intake Form — Builders deliverable. This is a starter shell inside the 434
// design system (navbar + footer come from the layout). Build the real form
// here. Full brief: docs/intake-form.md.
export default function IntakeFormPage() {
  return (
    <section className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="font-geist-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
          Digital Canvas · Builders
        </p>
        <h1 className="font-ggx88 text-4xl sm:text-5xl text-neutral-900 mt-3">Intake Form</h1>
        <p className="mt-4 text-neutral-600 leading-relaxed max-w-prose">
          Build the underwriter intake form here — the front door that captures venture-credible
          problems from sponsors. This page is a starter inside the shared shell; replace it with
          your real form.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-neutral-600 list-disc pl-5">
          <li>The question framework comes from Underwriter Onboarding (SOPs → Digital Canvas → Frame).</li>
          <li>This is a <strong>prototype</strong> — the live intake lives in the admin; the lead dev ports your reviewed result in.</li>
          <li>Do <strong>not</strong> wire it to real/production endpoints — mock the submit.</li>
        </ul>
        <p className="mt-6 text-sm text-neutral-500">
          Full brief: <code className="text-neutral-700">docs/intake-form.md</code>
        </p>
      </div>
    </section>
  )
}
