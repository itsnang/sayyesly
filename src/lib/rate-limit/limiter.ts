import { createHmac } from "node:crypto";

/** At most `limit` hits in each fixed window of `windowMs`. */
export type RateLimitWindow = { limit: number; windowMs: number };

/**
 * How often one subject (a Creator, an IP, a chat) may do one thing. Usually a
 * short, generous burst window plus a longer one: a person who spams a bit
 * waits a minute, a script that keeps going is shut out for the hour.
 */
export type RateLimitRule = { name: string; windows: readonly RateLimitWindow[] };

export type RateLimitResult = { ok: true } | { ok: false; retryInMs: number };

/**
 * Where hits are counted. `increment` adds one hit to `key` in the fixed
 * window starting at `windowStart` and returns the window's count so far.
 */
export interface RateLimitStore {
  increment(key: string, windowStart: number, windowMs: number): Promise<number>;
}

type LimiterOptions = {
  store: RateLimitStore;
  /** Keys are HMAC'd with this, so the store never holds an IP or id. */
  secret: string;
  now?: () => number;
  onError?: (error: unknown) => void;
};

/**
 * Fixed-window rate limiting. Every window counts every hit, blocked ones too,
 * so hammering doesn't help. A window the store fails to count is let through:
 * a limiter problem must never be the thing that stops a Recipient answering.
 */
export function createRateLimiter({ store, secret, now = Date.now, onError = console.error }: LimiterOptions) {
  return {
    async check(rule: RateLimitRule, subject: string): Promise<RateLimitResult> {
      const at = now();
      const retries = await Promise.all(
        rule.windows.map(async ({ limit, windowMs }) => {
          const key = createHmac("sha256", secret).update(`${rule.name}:${windowMs}:${subject}`).digest("hex");
          const windowStart = Math.floor(at / windowMs) * windowMs;
          try {
            const count = await store.increment(key, windowStart, windowMs);
            return count > limit ? windowStart + windowMs - at : 0;
          } catch (error) {
            onError(error);
            return 0;
          }
        }),
      );
      const retryInMs = Math.max(0, ...retries);
      return retryInMs > 0 ? { ok: false, retryInMs } : { ok: true };
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;

/** Counts in this server's memory: lost on redeploy and not shared between replicas. */
export function createMemoryStore(): RateLimitStore {
  const windows = new Map<string, { windowStart: number; expiresAt: number; count: number }>();
  let lastSweep = 0;

  return {
    async increment(key, windowStart, windowMs) {
      // Window starts only move forward, so anything that ended before this one is gone for good.
      if (windowStart - lastSweep >= 60_000) {
        lastSweep = windowStart;
        for (const [k, w] of windows) if (w.expiresAt <= windowStart) windows.delete(k);
      }
      const current = windows.get(key);
      const count = current && current.windowStart === windowStart ? current.count + 1 : 1;
      windows.set(key, { windowStart, expiresAt: windowStart + windowMs, count });
      return count;
    },
  };
}
