import { describe, expect, test } from "bun:test";
import { createMemoryStore, createRateLimiter, type RateLimitRule, type RateLimitStore } from "./limiter";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

// 3 in a burst, 5 in an hour.
const rule: RateLimitRule = { name: "save", windows: [{ limit: 3, windowMs: MINUTE }, { limit: 5, windowMs: HOUR }] };
const other: RateLimitRule = { name: "delete", windows: [{ limit: 3, windowMs: MINUTE }] };

function setup(store: RateLimitStore = createMemoryStore()) {
  let time = HOUR * 500_000; // on an hour boundary
  const errors: unknown[] = [];
  const limiter = createRateLimiter({ store, secret: "test-secret", now: () => time, timeoutMs: 50, onError: (e) => errors.push(e) });
  const allowed = async (r: RateLimitRule, subject: string) => (await limiter.check(r, subject)).ok;
  return { limiter, allowed, errors, advance: (ms: number) => (time += ms) };
}

async function hits(allow: () => Promise<boolean>, n: number) {
  const results: boolean[] = [];
  for (let i = 0; i < n; i++) results.push(await allow());
  return results;
}

describe("rate limiter", () => {
  test("allows a burst up to the limit, then blocks", async () => {
    const { allowed } = setup();
    expect(await hits(() => allowed(rule, "creator-1"), 4)).toEqual([true, true, true, false]);
  });

  test("after a burst, the next minute starts fresh", async () => {
    const { allowed, advance } = setup();
    await hits(() => allowed(rule, "creator-1"), 3);
    advance(MINUTE);
    expect(await allowed(rule, "creator-1")).toBe(true);
  });

  test("someone who keeps going uses up the hour, and waits it out", async () => {
    const { allowed, advance } = setup();
    await hits(() => allowed(rule, "creator-1"), 3);
    advance(MINUTE);
    expect(await hits(() => allowed(rule, "creator-1"), 3)).toEqual([true, true, false]);
    advance(MINUTE);
    expect(await allowed(rule, "creator-1")).toBe(false);
    advance(HOUR - 2 * MINUTE);
    expect(await allowed(rule, "creator-1")).toBe(true);
  });

  test("blocked hits still count, so hammering doesn't reopen the window early", async () => {
    const { allowed, advance } = setup();
    await hits(() => allowed(rule, "creator-1"), 10);
    advance(MINUTE); // the burst window is new, but 10 hits already used up the hour
    expect(await allowed(rule, "creator-1")).toBe(false);
  });

  test("says how long until the blocking window ends", async () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 3; i++) await limiter.check(rule, "creator-1");
    advance(20_000);
    expect(await limiter.check(rule, "creator-1")).toEqual({ ok: false, retryInMs: 40_000 });

    advance(MINUTE); // 1:20 into the hour; 5 hits used
    await limiter.check(rule, "creator-1");
    expect(await limiter.check(rule, "creator-1")).toEqual({ ok: false, retryInMs: HOUR - 80_000 });
  });

  test("different subjects and different rules don't share counts", async () => {
    const { allowed } = setup();
    await hits(() => allowed(rule, "creator-1"), 3);
    expect(await allowed(rule, "creator-2")).toBe(true);
    expect(await allowed(other, "creator-1")).toBe(true);
    expect(await allowed(rule, "creator-1")).toBe(false);
  });

  test("allows the action when the store fails, and reports the error", async () => {
    const broken: RateLimitStore = { increment: () => Promise.reject(new Error("redis down")) };
    const { allowed, errors } = setup(broken);
    expect(await allowed(rule, "creator-1")).toBe(true);
    expect(errors).toHaveLength(1);
  });

  test("never waits long on a slow store: past the timeout the action goes ahead", async () => {
    const hanging: RateLimitStore = { increment: () => new Promise(() => {}) };
    const { allowed, errors } = setup(hanging);
    const started = performance.now();
    expect(await allowed(rule, "creator-1")).toBe(true);
    expect(performance.now() - started).toBeLessThan(500);
    expect(errors).toHaveLength(1);
  });

  test("counts all of a rule's windows in one call to the store", async () => {
    let calls = 0;
    const memory = createMemoryStore();
    const counting: RateLimitStore = { increment: (hits) => (calls++, memory.increment(hits)) };
    const { allowed } = setup(counting);
    await allowed(rule, "creator-1");
    expect(calls).toBe(1);
  });

  test("the store only ever sees a hash of the key, never the IP or id", async () => {
    const seen: string[] = [];
    const memory = createMemoryStore();
    const spy: RateLimitStore = { increment: (hits) => (seen.push(...hits.map((h) => h.key)), memory.increment(hits)) };
    const { allowed } = setup(spy);
    await allowed(other, "203.0.113.7");
    await allowed(other, "203.0.113.7");
    await allowed(rule, "203.0.113.7");

    expect(seen.every((key) => /^[0-9a-f]{64}$/.test(key) && !key.includes("203.0.113.7"))).toBe(true);
    expect(seen[0]).toBe(seen[1]!);
    expect(new Set(seen).size).toBe(3); // one per rule and window
  });
});
