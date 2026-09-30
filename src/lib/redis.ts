import "server-only";
import { Redis } from "@upstash/redis";
import { env } from "@/env";

/**
 * The app's Upstash Redis (rate limit counts, the shared cache), or null when
 * it isn't configured; callers then fall back to this instance's memory.
 */
export const redis: Redis | null =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null;
