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

/** One hit in one fixed window: `key` is already hashed and names the rule, window length and subject. */
export type WindowHit = { key: string; windowStart: number; windowMs: number };

/**
 * Where hits are counted. `increment` adds one hit to each window, in one
 * round trip, and returns each window's count so far, in the same order.
 */
export interface RateLimitStore {
  increment(hits: readonly WindowHit[]): Promise<number[]>;
}

type LimiterOptions = {
  store: RateLimitStore;
  /** Keys are HMAC'd with this, so the store never holds an IP or id. */
  secret: string;
  now?: () => number;
  /** The most a check may add to an action; a slower store is treated as failed. */
  timeoutMs?: number;
  onError?: (error: unknown) => void;
};

/**
 * Fixed-window rate limiting. Every window counts every hit, blocked ones too,
 * so hammering doesn't help. When the store fails or is slow the action goes
 * ahead: a limiter problem must never block a Recipient or slow the app down.
 */
export function createRateLimiter({ store, secret, now = Date.now, timeoutMs = 300, onError = () => {} }: LimiterOptions) {
  return {
    async check(rule: RateLimitRule, subject: string): Promise<RateLimitResult> {
      const at = now();
      const hits = rule.windows.map(({ windowMs }) => ({
        key: createHmac("sha256", secret).update(`${rule.name}:${windowMs}:${subject}`).digest("hex"),
        windowStart: Math.floor(at / windowMs) * windowMs,
        windowMs,
      }));

      let counts: number[];
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        counts = await Promise.race([
          store.increment(hits),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error(`rate limit store took over ${timeoutMs}ms`)), timeoutMs);
          }),
        ]);
      } catch (error) {
        onError(error);
        return { ok: true };
      } finally {
        clearTimeout(timer);
      }

      const retryInMs = Math.max(
        0,
        ...hits.map((hit, i) => ((counts[i] ?? 0) > rule.windows[i]!.limit ? hit.windowStart + hit.windowMs - at : 0)),
      );
      return retryInMs > 0 ? { ok: false, retryInMs } : { ok: true };
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;

/** Counts in this server's memory: lost on redeploy and not shared between instances. */
export function createMemoryStore(): RateLimitStore {
  const windows = new Map<string, { windowStart: number; expiresAt: number; count: number }>();
  let lastSweep = 0;

  function incrementOne({ key, windowStart, windowMs }: WindowHit): number {
    // Window starts only move forward, so anything that ended before this one is gone for good.
    if (windowStart - lastSweep >= 60_000) {
      lastSweep = windowStart;
      for (const [k, w] of windows) if (w.expiresAt <= windowStart) windows.delete(k);
    }
    const current = windows.get(key);
    const count = current && current.windowStart === windowStart ? current.count + 1 : 1;
    windows.set(key, { windowStart, expiresAt: windowStart + windowMs, count });
    return count;
  }

  return { increment: async (hits) => hits.map(incrementOne) };
}
