import { describe, expect, test } from "bun:test";
import { createMemoryStore, createRateLimiter, type RateLimitRule, type RateLimitStore } from "./limiter";

const rule: RateLimitRule = { name: "save", limit: 3, windowMs: 60_000 };
const other: RateLimitRule = { name: "delete", limit: 3, windowMs: 60_000 };

function setup(store: RateLimitStore = createMemoryStore()) {
  let time = 60_000 * 29_000_000; // on a minute boundary
  const errors: unknown[] = [];
  const limiter = createRateLimiter({ store, secret: "test-secret", now: () => time, onError: (e) => errors.push(e) });
  return { limiter, errors, advance: (ms: number) => (time += ms) };
}

async function hits(allow: () => Promise<boolean>, n: number) {
  const results: boolean[] = [];
  for (let i = 0; i < n; i++) results.push(await allow());
  return results;
}

describe("rate limiter", () => {
  test("allows up to the limit in a window, then blocks", async () => {
    const { limiter } = setup();
    expect(await hits(() => limiter.allow(rule, "creator-1"), 4)).toEqual([true, true, true, false]);
  });

  test("a new window starts fresh", async () => {
    const { limiter, advance } = setup();
    await hits(() => limiter.allow(rule, "creator-1"), 4);
    advance(60_000);
    expect(await limiter.allow(rule, "creator-1")).toBe(true);
  });

  test("blocked hits still count, so hammering doesn't reopen the window early", async () => {
    const { limiter, advance } = setup();
    await hits(() => limiter.allow(rule, "creator-1"), 10);
    advance(59_000);
    expect(await limiter.allow(rule, "creator-1")).toBe(false);
  });

  test("different subjects and different rules don't share counts", async () => {
    const { limiter } = setup();
    await hits(() => limiter.allow(rule, "creator-1"), 3);
    expect(await limiter.allow(rule, "creator-2")).toBe(true);
    expect(await limiter.allow(other, "creator-1")).toBe(true);
    expect(await limiter.allow(rule, "creator-1")).toBe(false);
  });

  test("allows the action when the store fails, and reports the error", async () => {
    const broken: RateLimitStore = { increment: () => Promise.reject(new Error("database down")) };
    const { limiter, errors } = setup(broken);
    expect(await limiter.allow(rule, "creator-1")).toBe(true);
    expect(errors).toHaveLength(1);
  });

  test("the store only ever sees a hash of the key, never the IP or id", async () => {
    const seen: string[] = [];
    const memory = createMemoryStore();
    const spy: RateLimitStore = { increment: (key, windowStart, windowMs) => (seen.push(key), memory.increment(key, windowStart, windowMs)) };
    const { limiter } = setup(spy);
    await limiter.allow(rule, "203.0.113.7");
    await limiter.allow(rule, "203.0.113.7");
    await limiter.allow(other, "203.0.113.7");

    expect(seen.every((key) => /^[0-9a-f]{64}$/.test(key) && !key.includes("203.0.113.7"))).toBe(true);
    expect(seen[0]).toBe(seen[1]!);
    expect(seen[2]).not.toBe(seen[0]!);
  });
});
