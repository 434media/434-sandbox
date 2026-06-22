# Discovery Intake Form — brief

A web form that captures **new-business discovery** for a prospective client — the **front door of the 434 Media sales funnel**. The Client Success / Sales team fills it out about a prospect so 434 can build an optimal **v1.0 sales pitch**, then the lead flows into outbound. Build it at the [`/intake-form`](../app/intake-form) route.

> **Direction (from leadership → Build team):** Build this form, then progress to **lead and outbound workflows** (i.e. an email drip campaign). Get **design direction guidance from Content** before locking visuals.

## Reference form

The question set is modeled on this live example — match the *types* of questions, not the exact wording, and swap any agency-specific framing to **434 Media**:

> New Business Discovery Intake Form — https://docs.google.com/forms/d/e/1FAIpQLSdG4_tJkBXhWifYBMPNPvColkSQSvSWebgOcawAlYnXcGPNmQ/viewform

## What you're building

A clean, friendly multi-step form that an internal team member completes about a prospect. It captures enough context for Client Success to draft a sharp first pitch. Capture, at minimum:

**Who & where**
- Submitter email
- Client / company name
- Primary website URL
- Primary contact name and role

**The opportunity**
- Why is the client exploring **434 Media's** services *now*? (the trigger — launch, growth, declining sales, market expansion, replacing an agency, an event, etc.)
- Primary objective(s) for the campaign — *Lead Generation · E-Commerce Sales · Event Attendance/Tickets · Donations/Fundraising · Brand Awareness · Website Traffic · Other*
- Target geography
- Target audience (age, income, industry, interests, B2B/B2C, key segments)

**Media plan inputs**
- Channels to **focus on** *(checkboxes: Paid Search · Paid Social · SEO/GEO · Display · Pre-Roll/YouTube · CTV/OTT · Email · Other)*
- Channels/products to **avoid** *(same options)*
- Approximate **monthly paid-media budget** *(Under $5k · $5–15k · $15–50k · $50k+ · Other)*
- Ideal **campaign start** *(ASAP · within a month · 1–3 months · 3+ months)*

**Sharpening the pitch**
- Key competitors
- Unique selling proposition (USP)
- Additional notes / context (messaging, concerns, regulatory issues, prior results, internal constraints)

Mark the same fields required that the reference form does (email, company, URL, contact, the "why now", objective, geography, audience, channels-to-avoid, budget). Keep the rest optional.

## The funnel — build order

This form is **phase 1** of a pipeline. Build it well, then progress:

1. **Discovery intake form** *(this deliverable)* — capture the prospect, validate, store the lead.
2. **Lead workflow** — the submission becomes a tracked lead (status, owner, the captured discovery data).
3. **Outbound workflow** — an **email drip campaign** kicked off from the lead.

Scope phase 1 first; design the data shape so a lead/outbound step can hang off it cleanly. Coordinate timing with the lead dev.

## Design direction

Visuals and copy tone are **owned by Content** — get their guidance before finalizing layout, color, and wording. Build inside the shared 434 shell (navbar + footer come from the layout) so it's on-brand from the start.

## Important constraints

- **Sandbox, not production.** Nothing here connects to live 434 systems.
- **Do not wire it to real/production endpoints or data.** Mock the submission (or send to a throwaway store the lead dev sets up). When it's reviewed, the lead dev ports the result into the real stack — **you never push to production.**

## Done looks like

A working, reviewed form (feature branch → PR → merged to `main`) with a clear submit flow, sensible validation, and the discovery question set above. Note design decisions, what Content signed off on, and any open questions for the lead/outbound phases in the PR.
