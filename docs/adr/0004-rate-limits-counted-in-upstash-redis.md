# Rate limits are counted in Upstash Redis, in fixed windows, and fail open fast

The app runs as Vercel functions, so rate limits counted in memory were counted separately in every function instance and reset on every deploy: a limit of 20 was really 20 per instance. The counts now live in Upstash Redis, reached over HTTPS with `@upstash/redis`. Each rule has a burst window and an hourly cap; one Lua script increments both windows' keys (giving each a TTL on its first hit) in a single round trip.

## Considered

- **Keep counting in memory.** Free, but on serverless the limits barely hold, which is the point of having them.
- **A table in our Postgres.** No new service, but two writes to the main database on every limited action, including the Recipient page's frequent "still answered?" check, plus a migration and a cleanup job for old rows. Redis keys expire by themselves.
- **`@upstash/ratelimit`.** Well made, but it would replace our limiter rather than sit behind it: we already have two windows per rule, keys HMAC'd so no IP or id is stored, one rules table, and tests at the limiter's interface. A small store adapter keeps all of that.
- **Sliding windows.** Exact, but costlier per check. With limits this generous, a fixed window letting up to twice the limit through across a boundary doesn't matter.

## Consequences

- One HTTPS round trip per limited action (the Answer's two rules run together). Put the Upstash database in the same region as the functions to keep it to a few milliseconds.
- **Fail open, fast:** if Redis errors or takes over 300 ms, the action goes ahead and the problem is logged. A limiter problem must never block a Recipient or slow the app down.
- **No raw identifiers are stored:** keys are an HMAC (with `SESSION_SECRET`) of the rule, window and subject. Rotating `SESSION_SECRET` starts every count from zero.
- Without `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` the limiter falls back to counting in memory (and warns in production), so local development needs no Redis.
- About two Redis commands' worth of cost per limited action (one script call); the free tier covers far more than our traffic.
