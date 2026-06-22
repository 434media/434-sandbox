# 434 Sandbox

A **sandbox** for the Digital Canvas cohort's **Builders** squad. Two deliverables live here:

| Folder | What it is |
|--------|------------|
| [`intake-form/`](./intake-form) | The underwriter **intake form** — a web form that captures real-world problems from sponsors/underwriters. |
| [`sales-deck/`](./sales-deck) | A **web-based sales deck** — the 434 / Digital Canvas pitch, with Lab Cafe as the customer example. |

---

## ⚠️ This is a sandbox, not production

Nothing in this repo is wired to live 434 Media systems. You **cannot** break the admin platform or any production site from here — that's the whole point.

- The **real** underwriter intake (the one that captures live submissions) already lives in the 434 admin app. The form you build here is a **prototype/redesign**. When it's reviewed and ready, the lead dev ports the result into the admin — **you never push to the production repo.**
- Do **not** connect the intake form to real production data or live endpoints. Use a mock or a throwaway store while you build (ask the lead dev if you're unsure).
- The sales deck has no such constraint — it's a standalone marketing page and can be deployed on its own.

---

## How we work — the PR flow

Everything ships through pull requests. **Don't commit straight to `main`.**

1. **Branch** off `main` for each piece of work — short and specific:
   `git checkout -b feature/intake-form-validation`
2. **Commit** in small steps with clear messages.
3. **Push** your branch: `git push -u origin feature/intake-form-validation`
4. **Open a PR** into `main`. Describe what you did and add a screenshot if it's visual.
5. The **lead dev reviews** and merges. Keep branches short-lived — merge often, avoid giant long-running branches.

> Branches are for work that merges back soon. One feature = one branch = one PR.

If preview deployments are enabled, every PR gets a clickable URL — share it in the PR and in Discord so the team and founder can see it live.

---

## Where we talk

- **Daily chat & idea-swapping →** the **DevSA Discord** (your squad channel). Quick questions, feedback, "is this any good?", sharing links.
- **Decisions, tasks & deliverables →** the cohort board in the 434 admin. Discord holds the conversation; the board and your PRs hold the work.

---

## Getting started

Each folder has its own `README` with what to build. Pick your stack with the lead dev before you scaffold — keep it simple and well-documented so the next person (and the review) can follow it.
