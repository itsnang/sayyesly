import { bigint, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { invites } from "./invite.table";

// A Telegram group notified about one Invite's Answer.
export const linkedGroups = pgTable(
  "linked_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inviteId: uuid("invite_id")
      .notNull()
      .references(() => invites.id, { onDelete: "cascade" }),
    chatId: bigint("chat_id", { mode: "bigint" }).notNull(),
    chatTitle: text("chat_title"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("linked_groups_invite_chat_unique").on(t.inviteId, t.chatId)],
);

export type LinkedGroup = typeof linkedGroups.$inferSelect;
export type NewLinkedGroup = typeof linkedGroups.$inferInsert;
