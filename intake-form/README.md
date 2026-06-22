# Intake Form

A web form that captures **venture-credible problems** from corporate/institutional underwriters and sponsors — the front door of the Digital Canvas pipeline.

## What you're building

A clean, friendly multi-step form that pulls out a *specific, real* problem, not a vague one. The Underwriter Onboarding squad designs the **question framework** (in the SOPs → Digital Canvas → Frame space); you engineer the form from it.

Capture, at minimum:
- Who's submitting (name, role, org, contact email)
- The problem in their own words
- **Who's affected** and how often
- The **current workaround** (the manual duct-tape where today's system fails)
- **Cost / impact** of the problem
- **Evidence** it's real
- Is it an **optimization bottleneck** (saves staff hours) or a **growth gap** (new space)?

## Important constraints

- **Prototype, not production.** The live intake already exists in the 434 admin. This is a redesign the lead dev ports in once it's reviewed.
- **Do not wire it to real/production endpoints or data.** Mock the submission, or send to a throwaway store the lead dev sets up. Never point it at live underwriter data.

## Done looks like

A working, reviewed form (feature branch → PR → merged to `main`) with a clear submit flow, sensible validation, and the question set the Onboarding squad finalized. Add a short note in the PR of any decisions or open questions.
