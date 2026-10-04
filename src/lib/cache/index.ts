import "server-only";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { createCache, createMemoryCacheStore, type CacheStore } from "./cache";

function createStore(): CacheStore {
  if (!redis) return createMemoryCacheStore();
  const client = redis;
  return {
    get: (key) => client.get(`cache:${key}`),
    set: async (key, value, ttlSeconds) => {
      await client.set(`cache:${key}`, value, { ex: ttlSeconds });
    },
  };
}

/** Shared across every server instance when Redis is configured. See docs/adr/0004. */
export const cache = createCache({ store: createStore(), onError: (error) => logger.error("cache.failed", error) });

export const DAY_SECONDS = 86_400;
