# Errors are tracked in PostHog, and server code logs through one logger

Analytics already ran on PostHog (anonymous, same-origin through `/ingest`). Errors now go to the same project: nothing watched the Telegram or CutLuy webhooks, where a silent failure costs a payment or a notification.

**Server.** `src/lib/logger` is the only way server code talks to the console. `logger.info/warn/error(event, …)` writes one JSON line to stdout (Vercel collects it); `error` also sends the exception to PostHog with `posthog-node`, reusing `NEXT_PUBLIC_POSTHOG_KEY` and calling `us.i.posthog.com` directly (the `/ingest` rewrite is for browsers). Next.js's `onRequestError` (`src/instrumentation.ts`) feeds it the errors Next catches itself. Events are sent at once (`flushAt: 1`) inside `after()`, because a function freezes once it has responded.

**Browser.** `capture_exceptions` is on for unhandled errors and rejections, and `error.tsx` / `global-error.tsx` report the ones React's error boundaries swallow, then show a plain "try again" screen.

## What is sent

The same promise as the rest of analytics: ids and enums, never free text.

- Events are anonymous: distinct id `"server"`, no Person profile. A Creator id is only an event property.
- An error's **message is always dropped** (a database error can quote a slug or a Creator's words; `sanitizeEvent` removes it). What identifies the failure is the exception type, the stack frames and the logger's `event` name (`cutluy_webhook.second_paid_purchase`), which we wrote.
- Stack frame URLs lose query strings and Invite slugs, like every other URL.
- Context passed to the logger is `string | number | boolean | null | undefined`: ids and enums only.

## Decisions

- **Only unexpected failures are errors.** Validation, rate limits and ownership checks return `{ error }`; those never reach the logger. Things a stranger can trigger at will (a webhook with a bad signature or amount) are `logger.warn`: logged, not sent.
- **Deduped per instance.** The same event, error type and first stack frame reports once a minute per instance, so a bad deploy or a script can't burn the PostHog quota. Exact across instances would need Redis; this is cheap and enough to cap cost.
- **`no-console` in `src`**, so the convention can't rot. `env.ts` is the one exception: the logger depends on it.
- **Source maps** are uploaded by `@posthog/nextjs-config` during the production build, only when `POSTHOG_PERSONAL_API_KEY` and `POSTHOG_PROJECT_ID` are set. Without them stacks are minified and nothing else changes. Its CLI needs a postinstall (`trustedDependencies`).

## Considered

- **Sentry or another tracker.** A second vendor, a second consent story and a second CSP entry, for something PostHog already receives.
- **pino or winston.** Vercel already collects stdout; a few lines of JSON don't need a library.
- **Sending every `{ error }` result.** Mostly noise (a mistyped form), and it would put user input near the pipeline.

## Consequences

- A `posthog-node` dependency, and two optional build-time variables.
- Errors in the studio or any action that is *caught and turned into `{ error }`* are only seen if that code calls `logger.error`. Catch blocks that swallow an unexpected error should.
- `onRequestError` has no request scope for `after()`, so it awaits `logger.error` itself before returning.
- A `console.*` call in `scripts/` is fine: the rule covers `src` only.
