import "server-only";
import type { Redis } from "@upstash/redis";
import type { RateLimitStore } from "./limiter";

// Counts one hit in every window it's given (KEYS[i] with its length in ARGV[i]);
// a window's first hit makes its key expire with the window. One round trip per check.
const INCREMENT = `
local counts = {}
for i, key in ipairs(KEYS) do
  local count = redis.call("INCR", key)
  if count == 1 then redis.call("PEXPIRE", key, ARGV[i]) end
  counts[i] = count
end
return counts
`;

/**
 * Counts in Upstash Redis, so limits hold across every serverless instance
 * and deploy. See docs/adr/0004.
 */
export function createRedisStore(redis: Redis): RateLimitStore {
  return {
    async increment(hits) {
      const counts = await redis.eval<string[], number[]>(
        INCREMENT,
        hits.map((h) => `rl:${h.key}:${h.windowStart}`),
        hits.map((h) => String(h.windowMs)),
      );
      return counts.map(Number);
    },
  };
}
