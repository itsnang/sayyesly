import { createHmac } from "node:crypto";

/** How often one subject (a Creator, an IP, a chat) may do one thing. */
export type RateLimitRule = { name: string; limit: number; windowMs: number };

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
 * Fixed-window rate limiting. Blocked hits still count, so hammering doesn't
 * help. When the store fails the action is allowed: a limiter problem must
 * never be the thing that stops a Recipient answering.
 */
export function createRateLimiter({ store, secret, now = Date.now, onError = console.error }: LimiterOptions) {
  return {
    async allow(rule: RateLimitRule, subject: string): Promise<boolean> {
      const key = createHmac("sha256", secret).update(`${rule.name}:${subject}`).digest("hex");
      const windowStart = Math.floor(now() / rule.windowMs) * rule.windowMs;
      try {
        return (await store.increment(key, windowStart, rule.windowMs)) <= rule.limit;
      } catch (error) {
        onError(error);
        return true;
      }
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
