import { index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

// Hits counted against one rate limit in one fixed window. The key is an HMAC
// of the rule and its subject (a Creator id, an IP, a chat), never the raw value.
export const rateLimitHits = pgTable(
  "rate_limit_hits",
  {
    keyHash: text("key_hash").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.keyHash, t.windowStart] }), index("rate_limit_hits_expires_at_idx").on(t.expiresAt)],
);
