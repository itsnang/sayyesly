# How can a SvelteKit app share sayyesly's Postgres and Drizzle schema?

Research for [#35](https://github.com/itsnang/Ask-her-out/issues/35) (part of #33). Written 2026-09-24.
The recommendation at the end is **input** to the decision in
[#36](https://github.com/itsnang/Ask-her-out/issues/36) ("How does the admin app reach sayyesly's data?"); it does not make that decision.

Points marked **(unconfirmed)** were not verified against a primary source or by running the command.

## What the admin app needs

- **Read**: Creators (`users`), Purchases (`purchases`), Themes (`themes`).
- **Write**: only `themes`: publish/hide (`is_active`), price (`price_cents`), name, reorder (`sort_order`).
  It does not need to create Themes: a Theme's visuals are code in `src/features/invites/themes/<id>/`, so a
  `themes` row without matching code is useless. New rows keep coming from `bun run db:seed`.
- It lives in **its own repo** (SvelteKit + shadcn-svelte), deployed as a second service.

## What sayyesly has today (from the repo)

- Schema: `src/lib/db/schema/*.table.ts`, re-exported (with `relations()`) from `src/lib/db/schema/index.ts`.
  The table files import only `drizzle-orm` (plus a local `PlanPhoto` type), so they are portable.
- `drizzle.config.ts`: `schema: ./src/lib/db/schema/index.ts`, `out: ./drizzle/migrations`, dialect `postgresql`.
  One migration so far (`0000_init.sql`). Railway runs `drizzle-kit migrate` as the pre-deploy command.
- Client: `drizzle-orm/postgres-js` over `postgres` (`src/lib/db/client.ts`), pool max 10.
- Themes are read **uncached** on every request (`billing/server/data.ts`, `invites/server/theme-access.ts`),
  so a direct DB write to `themes` is visible to sayyesly immediately; no cache to invalidate.
- Payment safety does not depend on who edits `themes`: `buy.ts` copies `theme.priceCents` into
  `purchases.amount_cents` when the attempt starts, and `handle-webhook.ts` compares CutLuy's amount with
  `purchase.amountCents`, not the current Theme price. A price change mid-checkout cannot unlock a Theme
  for the wrong amount. Hiding a Theme (`is_active = false`) blocks new checkouts (`buy.ts`: `if (!theme?.isActive)`).

## Platform facts the options rely on

**Railway**
- Services in one project environment reach each other over a private WireGuard network at
  `SERVICE_NAME.railway.internal`; "each environment has its own isolated network."
  ([Private networking](https://docs.railway.com/guides/private-networking))
- "Private networking is only available at **runtime**, not during the build phase." Newer environments
  (after 2025-10-16) resolve internal names to IPv4 and IPv6; legacy ones to IPv6 only.
  ([How it works](https://docs.railway.com/networking/private-networking/how-it-works))
- Reference variables: `${{SERVICE_NAME.VAR}}`, `${{shared.VAR}}`; `RAILWAY_PRIVATE_DOMAIN` for internal calls.
  ([Variables](https://docs.railway.com/guides/variables))
- The Postgres template exposes `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `DATABASE_URL`
  (and `DATABASE_PUBLIC_URL` with public access). ([PostgreSQL](https://docs.railway.com/guides/postgresql))
- Extra roles are possible: Railway's own credential-rotation guide runs `CREATE ROLE ... WITH LOGIN PASSWORD ...`
  on the template DB. ([Rotate credentials](https://docs.railway.com/guides/rotate-credentials-zero-downtime))
  Railway has **no** documented read-only/least-privilege role feature; you do it with plain SQL. Whether the
  template's default `PGUSER` is a superuser is not stated in the docs **(unconfirmed; assume it has full rights)**.

**PostgreSQL** — privileges can be granted per column: `GRANT UPDATE (col, ...) ON table TO role`. Caveat from the
docs: a table-level grant is not narrowed by revoking one column, so grant columns, never the table.
([GRANT](https://www.postgresql.org/docs/current/sql-grant.html))

**Drizzle**
- `drizzle-kit pull` introspects a live DB and writes a Drizzle schema file; supports `tablesFilter`
  and `schemaFilter` globs. ([drizzle-kit pull](https://orm.drizzle.team/docs/drizzle-kit-pull))
- Drizzle calls this "database first": "your database schema is a source of truth."
  ([Migrations](https://orm.drizzle.team/docs/migrations))
- Pull also emits a `relations.ts` **(unconfirmed; not stated on the pages read)**. Pull cannot recover
  TypeScript-only information such as `jsonb().$type<PlanPhoto[]>()` or `bigint({ mode: "bigint" })`
  choices **(unconfirmed; follows from introspecting SQL types)**. None of the three admin tables use jsonb;
  `users.telegram_id` is a `bigint`.

**SvelteKit**
- Code in `$lib/server`, `*.server.ts`, and `$env/static/private` / `$env/dynamic/private` is server-only; any
  import chain from client code into it is a build error. ([Server-only modules](https://svelte.dev/docs/kit/server-only-modules))
- `+page.server.ts` `load` functions and form actions run on the server; after an action, `load` re-runs.
  ([Form actions](https://svelte.dev/docs/kit/form-actions)) This is where Drizzle queries or API calls go.
- `adapter-node` builds a Node server (`node build`), configured with `PORT`, `HOST`, `ORIGIN`.
  ([adapter-node](https://svelte.dev/docs/kit/adapter-node)) Railway runs this like any Node service.

**GitHub Packages** (for option B): only scoped packages (`@itsnang/...`); "You need an access token to publish,
install, and delete private, internal, and public packages" (PAT classic, `read:packages`), set in `.npmrc`.
([npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry))

## The options

### A. Same Postgres, hand-copied Drizzle schema in the admin repo

- **Sync**: manual. When sayyesly adds/renames a column on the three tables, someone edits the copy. A renamed or
  dropped column breaks the admin at query time, not at build time. Added columns are harmless (Drizzle selects
  named columns).
- **Migrations**: sayyesly only. The admin repo must never run `drizzle-kit push`/`migrate`/`generate`; a push from
  a stale copy could drop columns. Enforce with the DB role (below), not just discipline.
- **Security**: a second service holds DB credentials. Mitigated with a dedicated role, e.g.
  ```sql
  CREATE ROLE admin_app WITH LOGIN PASSWORD '...';
  GRANT CONNECT ON DATABASE railway TO admin_app;
  GRANT USAGE ON SCHEMA public TO admin_app;
  GRANT SELECT ON users, purchases, themes TO admin_app;
  GRANT UPDATE (name, price_cents, is_active, sort_order) ON themes TO admin_app;
  ```
  No `CREATE`, no `INSERT`/`DELETE`, no access to `invites`/`answers`, no way to mark a Purchase `paid`. The
  app's rules (paid unlock only via verified webhook) are then enforced by Postgres itself for this client.
  Do **not** give the admin `${{Postgres.DATABASE_URL}}` (full rights); build its URL from
  `${{Postgres.RAILWAY_PRIVATE_DOMAIN}}`, `${{Postgres.PGPORT}}`, `${{Postgres.PGDATABASE}}` and its own
  secret password variable.
- **Railway cost**: low. Same project, private network, one SQL script run once, two variables.
  The admin needs no DB at build time (fits "runtime only" private networking).
- **SvelteKit fit**: good. `drizzle(postgres(env.ADMIN_DATABASE_URL))` in `$lib/server/db.ts`; reads in
  `+page.server.ts` `load`, writes in form actions with zod validation. Server-only guard keeps credentials off the client.

### B. Shared schema as a package (npm / GitHub Packages / git submodule)

- **Sync**: explicit version bump in the admin repo; TypeScript catches renamed columns at build time.
- **Migrations**: still sayyesly (the package would carry only table definitions, not `drizzle/migrations`).
- **Security**: same as A (still a direct DB connection), plus a registry token (GitHub Packages needs a PAT
  even to install) or submodule access in the admin's Railway build.
- **Railway cost**: highest of the DB options. sayyesly is a single Next.js app, not a monorepo: extracting
  `src/lib/db/schema` into a publishable package means a workspace/build step and a publish pipeline in
  sayyesly, plus `.npmrc` + token in the admin build. A bun git dependency on the whole sayyesly repo would pull
  the Next app's `package.json` and deps **(unconfirmed how cleanly bun handles a sub-path; likely not supported
  without a separate package)**. A submodule avoids a registry but needs repo access at Railway build time.
- **SvelteKit fit**: fine once installed. Overkill for three tables and one consumer.

### C. Admin generates its schema with `drizzle-kit pull`

- **Sync**: regenerate on demand (`drizzle-kit pull` with `tablesFilter: ["users", "purchases", "themes"]`)
  against a dev DB migrated to sayyesly's latest migration, then commit the output. Mechanical, so no hand-typing
  errors; drift still only caught when someone re-pulls (could be a CI job that pulls and diffs **(not built)**).
- **Migrations**: sayyesly only; this is exactly Drizzle's "database first" mode for the admin repo. The admin's
  `drizzle.config.ts` should have no `out`-based migrate usage; again enforce with the role.
- **Security / Railway / SvelteKit**: same as A. Pulling against production needs a public URL or `railway run`
  from a local machine, so pull against the **dev** DB instead (CLAUDE.md already says local work uses a separate dev DB).
- **Loses**: TS-only details (jsonb `$type`, `bigint` mode) **(unconfirmed)**; for these tables only
  `users.telegram_id` matters, fixable with a one-line hand edit or by reading it as a string.

### D. No DB access; sayyesly exposes an authenticated admin HTTP API

- **Sync**: the API contract is the boundary, so sayyesly can change its schema freely as long as responses stay
  stable. The admin needs no Drizzle at all.
- **Migrations**: sayyesly only, trivially.
- **Security**: strongest separation. No DB credentials in the admin; all writes go through sayyesly's zod
  validation and domain rules. Needs service-to-service auth: a shared secret or signed token (e.g. `jose`,
  already a dependency) sent from SvelteKit server code over `sayyesly.railway.internal`, and the routes should
  reject calls not coming with that token. The routes are still public-reachable on sayyesly's domain unless
  checked, so the token check is essential.
- **Railway cost**: low infra (private network, reference variable for the URL, one shared secret), but the
  **most code**: new route handlers in sayyesly (a new `admin` slice per the vertical-slice rule), a response
  contract, pagination/filtering for Creator and Purchase lists, and tests. Every new admin screen needs
  sayyesly changes and a deploy of both apps.
- **SvelteKit fit**: good: `fetch` from `+page.server.ts` `load`/actions (server-side, so the secret stays private).

## Comparison

| | Sync on schema change | Migration owner | DB creds in admin | Setup effort | Code per new admin screen |
|---|---|---|---|---|---|
| A. Copy | manual, runtime breakage | sayyesly | yes (restricted role) | low | admin only |
| B. Package | version bump, compile-time | sayyesly | yes (restricted role) + registry token | high | admin (+ publish) |
| C. `pull` | regenerate, mechanical | sayyesly | yes (restricted role) | low | admin only |
| D. API | contract; none needed | sayyesly | no | medium (code) | both apps |

## Recommendation (input to #36, not the decision)

Ranking for the current scope (read three tables, edit four `themes` columns):

1. **C, with a least-privilege Postgres role.** Direct Drizzle access from SvelteKit server code, schema pulled
   for just `users`, `purchases`, `themes`, and a role that can only `SELECT` those and `UPDATE` four `themes`
   columns. Postgres then enforces the important rules (no marking Purchases paid, no migrations, no touching
   Invites) for the admin regardless of admin-code bugs. Cheapest to build; sayyesly's code does not change.
2. **D, admin API.** Choose this instead if the admin will soon do **business actions** rather than edit rows:
   refunds, granting a Theme, re-sending Telegram messages, anything that must run sayyesly's domain logic. Those
   must not be re-implemented in a second repo. D is also the choice if the owner wants zero DB credentials outside sayyesly.
3. **A.** Same as C but hand-typed; only worth it if pulling is inconvenient.
4. **B.** Real type safety across repos, but packaging a single-app repo's schema for one consumer costs more than it saves.

A C-then-D path is reasonable: start with C for read-mostly screens, add sayyesly endpoints only when an
admin action needs domain logic. Whatever #36 picks, **sayyesly stays the only owner of migrations**.

Open points for the owner:
- Should admin price/visibility changes be audited (who changed what)? With C, add an `updated_at`/audit table
  via a sayyesly migration; with D, sayyesly logs it.
- Where the SQL for the admin role lives (a checked-in script in sayyesly, e.g. `scripts/`, so it's reproducible
  per environment). Future sayyesly migrations that rename granted columns will need matching grants.
