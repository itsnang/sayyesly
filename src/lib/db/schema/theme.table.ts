import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Price and availability of a Theme. Its visuals live in code, in the theme
// registry, keyed by the same `id`. A price of 0 means the Theme is free.
// `regular_price_cents` is what it normally costs while it's on sale (shown
// crossed out); null when it isn't on sale. Only `price_cents` is charged.
export const themes = pgTable("themes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  regularPriceCents: integer("regular_price_cents"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;
