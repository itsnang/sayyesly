import "server-only";
import { lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimitHits } from "@/lib/db/schema";
import type { RateLimitStore } from "./limiter";

/** About one hit in a hundred also clears out windows that have ended. */
const SWEEP_CHANCE = 0.01;

/**
 * Counts in Postgres, so limits hold across redeploys and replicas. One
 * atomic upsert per hit; see docs/adr/0004.
 */
export function createPostgresStore(): RateLimitStore {
  return {
    async increment(key, windowStart, windowMs) {
      const [row] = await db
        .insert(rateLimitHits)
        .values({ keyHash: key, windowStart: new Date(windowStart), expiresAt: new Date(windowStart + windowMs), count: 1 })
        .onConflictDoUpdate({
          target: [rateLimitHits.keyHash, rateLimitHits.windowStart],
          set: { count: sql`${rateLimitHits.count} + 1` },
        })
        .returning({ count: rateLimitHits.count });

      if (Math.random() < SWEEP_CHANCE) {
        void db
          .delete(rateLimitHits)
          .where(lt(rateLimitHits.expiresAt, new Date()))
          .catch((error: unknown) => console.error("rate limit sweep failed", error));
      }
      if (!row) throw new Error("rate limit upsert returned no row");
      return row.count;
    },
  };
}
