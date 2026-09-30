import { describe, expect, test } from "bun:test";
import { createCache, createMemoryCacheStore, type CacheStore } from "./cache";

function setup(store: CacheStore = createMemoryCacheStore()) {
  const errors: unknown[] = [];
  const cache = createCache({ store, timeoutMs: 50, onError: (e) => errors.push(e) });
  let loads = 0;
  const load = (value: string | null) => async () => (loads++, value);
  return { cache, errors, load, loads: () => loads };
}

describe("cache", () => {
  test("loads on a miss, then serves the remembered value without loading again", async () => {
    const { cache, load, loads } = setup();
    expect(await cache.remember("song:abc", 60, load("Last Night on Earth"))).toBe("Last Night on Earth");
    expect(await cache.remember("song:abc", 60, load("something else"))).toBe("Last Night on Earth");
    expect(loads()).toBe(1);
  });

  test("different keys are remembered separately", async () => {
    const { cache, load } = setup();
    await cache.remember("song:a", 60, load("A"));
    expect(await cache.remember("song:b", 60, load("B"))).toBe("B");
  });

  test("a failed load (null) is not remembered, so the next call tries again", async () => {
    const { cache, load, loads } = setup();
    expect(await cache.remember("song:abc", 60, load(null))).toBeNull();
    expect(await cache.remember("song:abc", 60, load("found it"))).toBe("found it");
    expect(loads()).toBe(2);
  });

  test("a value expires after its time to live", async () => {
    let now = 0;
    const store = createMemoryCacheStore(() => now);
    const { cache, load } = setup(store);
    await cache.remember("song:abc", 60, load("old"));
    now = 61_000;
    expect(await cache.remember("song:abc", 60, load("new"))).toBe("new");
  });

  test("when the store fails, it loads directly and reports the error", async () => {
    const broken: CacheStore = { get: () => Promise.reject(new Error("redis down")), set: () => Promise.reject(new Error("redis down")) };
    const { cache, load, errors } = setup(broken);
    expect(await cache.remember("song:abc", 60, load("still works"))).toBe("still works");
    await new Promise((r) => setTimeout(r, 10)); // the write is fire-and-forget
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  test("never waits long on a slow store: past the timeout it loads directly", async () => {
    const hanging: CacheStore = { get: () => new Promise(() => {}), set: () => new Promise(() => {}) };
    const { cache, load } = setup(hanging);
    const started = performance.now();
    expect(await cache.remember("song:abc", 60, load("fast anyway"))).toBe("fast anyway");
    expect(performance.now() - started).toBeLessThan(500);
  });
});
