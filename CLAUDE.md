# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
bun dev              # start dev server at localhost:3000
bun run build        # production build
bun run lint         # ESLint
bun run typecheck    # tsc --noEmit
bun run db:generate  # generate a migration from src/lib/db/schema
bun run db:migrate   # apply migrations (Railway pre-deploy command)
bun run db:seed      # seed kitten-soft theme + the original invite (idempotent)
```

No test runner is configured. Quality gate: `bun run typecheck && bun run lint && bun run build`.

Copy `.env.example` to `.env.local`. Locally, point `DATABASE_URL` at a separate dev database, never production.

## Stack

- **Next.js 16** (App Router): breaking changes from prior versions; read `node_modules/next/dist/docs/` before writing code
- **React 19**, **TypeScript** (strict, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **PostgreSQL** + **Drizzle ORM** (`postgres` driver); migrations in `drizzle/migrations/`
- **Auth**: Telegram OpenID Connect + our own `jose`-signed session cookie; no better-auth (see `docs/adr/0001-telegram-oidc-instead-of-better-auth.md`)
- **Package manager**: bun

Domain vocabulary (Creator, Recipient, Invite, Answer, Theme…) is defined in `CONTEXT.md`. Use those terms in code, UI copy and messages.

## Architecture

Follows [nextjs-vertical-slice-starter-pack](https://github.com/itsnang/nextjs-vertical-slice-starter-pack): business logic lives in feature slices, routes stay thin.

```
src/
  app/                 routes only; compose slice components
  features/<slice>/    actions/ components/ themes/ utils/ types.ts data.ts
  lib/                 domain-agnostic shared code: db/, auth/, telegram/, site.ts
  env.ts               server-only, zod-validated env; use requireEnv() for optional vars
```

Slices: `invites` (invite page, themes, answer flow, editor), later `telegram-bot`, `billing`, `auth`. **Slices must not import from each other**; share through `src/lib/` or read the database directly.

### Themes

Themes are code: `src/features/invites/themes/<id>/` exports a `ThemeDefinition` (the Recipient-facing client component and the link-preview image renderer), registered in `themes/index.ts`. Price and availability live in the `themes` table under the same id. Themes receive all data as props and never load or save data themselves. Adding a Theme must not touch invite logic.

### Rules

- `'use server'` goes on each action file, never on the `actions/index.ts` barrel
- Auth check is the **first** thing in every action that needs a Creator; derive identity from the session (`getCurrentUser()` / `requireUser()`), never accept a user id from the client
- Validate every mutation's input with zod on the server. Never trust the client for prices, ownership or theme access
- `revalidatePath()` / `revalidateTag()` only **after** the mutation commits
- Actions return `{ error?: string }` on failure instead of throwing
- Absolute URLs and redirects are built from `NEXT_PUBLIC_APP_URL`; secrets never go in `NEXT_PUBLIC_*`
- Escape user text with `escapeHtml()` before sending it in Telegram HTML messages
- Files are kebab-case (`ask-screen.tsx`); exported components stay PascalCase
- Mobile-first; check layouts at 375px width

Fonts (Caveat + Architects Daughter) are loaded in `src/app/layout.tsx`; the kitten-soft design tokens are CSS variables in `src/app/globals.css`.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for itsnang/Ask-her-out, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one root `CONTEXT.md` plus `docs/adr/`. See `docs/agents/domain.md`.
