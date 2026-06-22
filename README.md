# 434 Sandbox

A **sandbox** for the Digital Canvas cohort's **Builders** squad. It's a small **Next.js app** pre-wired with the **434 design system** — the real navbar, hero video, and footer from the production site — so you build inside the look and feel from day one.

```
app/
  layout.tsx        ← shared shell: 434 navbar + footer + brand fonts
  page.tsx          ← home: the 434 hero video (design-system reference)
  intake-form/      ← deliverable 1 — build the discovery intake form (sales funnel) here
  sales-deck/       ← deliverable 2 — build the web sales deck here
components/         ← navbar, footer, hero + helpers (lifted from production)
docs/               ← the brief for each deliverable
```

| Route | What to build | Brief |
|-------|---------------|-------|
| `/intake-form` | The **discovery intake form** (top of the 434 sales funnel) | [docs/intake-form.md](./docs/intake-form.md) |
| `/sales-deck` | A web-based **sales deck** (Lab Cafe example) | [docs/sales-deck.md](./docs/sales-deck.md) |

## Run it

```bash
pnpm install
pnpm dev       # http://localhost:3000
```

The home page shows the 434 hero video inside the navbar/footer shell. `/intake-form` and `/sales-deck` are starter pages in that same shell — replace them with your work.

> The nav and footer links are the real 434 links and may point at pages that don't exist in this sandbox — that's fine. They're here to show the **design system**, not to be wired up.

## ⚠️ This is a sandbox, not production

Nothing here is connected to live 434 systems — you can't break the admin platform or any production site from here.

- The **discovery intake form** is **phase 1** of the 434 sales funnel (form → lead → outbound email drip). Build the form here as a **prototype**; when it's reviewed, the lead dev ports the result into the real stack — **you never push to the production repo.** Get **design direction from Content** before locking visuals.
- Do **not** connect the intake form to real production data or live endpoints. Mock the submit while you build (ask the lead dev if unsure).
- The sales deck has no such constraint — it's a standalone marketing page and can be deployed on its own.

The Shopify cart was intentionally removed from the navbar — not needed here.

## How we work — the PR flow

Everything ships through pull requests. **Don't commit straight to `main`.**

1. **Branch** off `main` for each piece of work: `git checkout -b feature/intake-form-validation`
2. **Commit** in small steps with clear messages.
3. **Push**: `git push -u origin feature/intake-form-validation`
4. **Open a PR** into `main`; describe what you did, add a screenshot if it's visual.
5. The **lead dev reviews** and merges. Keep branches short-lived — one feature = one branch = one PR.

If preview deployments are enabled, every PR gets a clickable URL — share it in the PR and in Discord.

## Where we talk

- **Daily chat & idea-swapping →** the **DevSA Discord** (your squad channel).
- **Decisions, tasks & deliverables →** the cohort board in the 434 admin. Discord holds the conversation; the board and your PRs hold the work.
