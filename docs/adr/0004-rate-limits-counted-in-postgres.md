# Rate limits are counted in Postgres, in fixed windows, and fail open

Rate limits used to be counted in each server's memory. A redeploy wiped the counts, and with more than one replica each counted on its own, so a limit of 20 was really 20 per replica per deploy. The counts now live in a `rate_limit_hits` table in the database we already run: one row per key per fixed window, counted with a single `INSERT … ON CONFLICT DO UPDATE SET count = count + 1 RETURNING count`.

## Considered

- **Keep counting in memory.** Free and fast, but the limits don't hold, which is the point of having them.
- **Redis.** Faster and built for this, but it's another Railway service to run and pay for, and another dependency, for a few hundred limited actions a day. At our traffic one small upsert on the private network costs a couple of milliseconds.
- **Sliding windows.** Exact, but they need a row per hit or a read before the write. With limits this generous, a fixed window letting up to twice the limit through across a window boundary doesn't matter.

## Consequences

- Every limited action makes one extra query (the Answer makes two: per IP and per Invite).
- **Fail open:** if the query fails, the action is allowed and the error is logged. A limiter problem must never be what stops a Recipient answering; if the database is really down, the action fails anyway.
- **No raw identifiers are stored:** keys are an HMAC (with `SESSION_SECRET`) of the rule and its subject, so the table holds no IP addresses or ids. Rotating `SESSION_SECRET` just starts every count from zero.
- About one hit in a hundred also deletes windows that have ended, so the table stays small without a scheduled job.
- The limiter talks to a store interface; an in-memory store stays for the unit tests.
