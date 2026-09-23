# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
bun dev        # start dev server at localhost:3000
bun build      # production build
bun lint       # run ESLint
```

No test runner is configured.

## Stack

- **Next.js 16** (App Router) — breaking changes from prior versions; read `node_modules/next/dist/docs/` before writing code
- **React 19**
- **TypeScript** — strict mode enabled
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **Package manager**: bun

## Architecture

App Router lives in `app/`. All routes are server components by default; mark client components with `"use client"`.

Path alias `@/*` resolves to the repo root (e.g. `@/app/page.tsx`).

Global styles are in [app/globals.css](app/globals.css). Fonts (Geist Sans + Geist Mono) are loaded in [app/layout.tsx](app/layout.tsx) and exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for itsnang/Ask-her-out, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one root `CONTEXT.md` plus `docs/adr/`. See `docs/agents/domain.md`.
