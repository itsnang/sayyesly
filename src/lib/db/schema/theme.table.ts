import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Price and availability of a Theme. Its visuals live in code, in the theme
// registry, keyed by the same `id`. A price of 0 means the Theme is free.
export const themes = pgTable("themes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;
