import { bigint, boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// A Creator. Identified by their numeric Telegram user ID, which is also the
// chat ID the bot uses to message them. `telegramSub` is the OIDC subject and
// stays null for a user seeded before they have ever logged in.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  telegramId: bigint("telegram_id", { mode: "bigint" }).notNull().unique(),
  telegramSub: text("telegram_sub").unique(),
  name: text("name").notNull(),
  username: text("username"),
  photoUrl: text("photo_url"),
  canDm: boolean("can_dm").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
