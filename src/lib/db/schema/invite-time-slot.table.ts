import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { invites } from "./invite.table";

export const inviteTimeSlots = pgTable(
  "invite_time_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inviteId: uuid("invite_id")
      .notNull()
      .references(() => invites.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("invite_time_slots_invite_id_idx").on(t.inviteId)],
);

export type InviteTimeSlot = typeof inviteTimeSlots.$inferSelect;
export type NewInviteTimeSlot = typeof inviteTimeSlots.$inferInsert;
