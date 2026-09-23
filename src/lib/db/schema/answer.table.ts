import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { inviteTimeSlots } from "./invite-time-slot.table";
import { invites } from "./invite.table";

export const answerKindEnum = pgEnum("answer_kind", ["yes", "maybe_later"]);

// The Answer to an Invite. The unique `invite_id` enforces one Answer per
// Invite, and an Invite counts as answered exactly when this row exists.
export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  inviteId: uuid("invite_id")
    .notNull()
    .unique()
    .references(() => invites.id, { onDelete: "cascade" }),
  kind: answerKindEnum("kind").notNull(),
  // Set when the Recipient chose one of the Time slots
  timeSlotId: uuid("time_slot_id").references(() => inviteTimeSlots.id, { onDelete: "set null" }),
  // The agreed moment: the chosen Time slot or a Custom time. Null for maybe_later.
  startsAt: timestamp("starts_at", { withTimezone: true }),
  note: text("note"),
  noDodges: integer("no_dodges").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AnswerRow = typeof answers.$inferSelect;
export type NewAnswerRow = typeof answers.$inferInsert;
export type AnswerKind = (typeof answerKindEnum.enumValues)[number];
