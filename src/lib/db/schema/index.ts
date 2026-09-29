import { relations } from "drizzle-orm";
import { inviteTimeSlots } from "./invite-time-slot.table";
import { invites } from "./invite.table";
import { linkedGroups } from "./linked-group.table";
import { purchases } from "./purchase.table";
import { answers } from "./answer.table";
import { themes } from "./theme.table";
import { users } from "./user.table";

export const userRelations = relations(users, ({ many }) => ({
  invites: many(invites),
  purchases: many(purchases),
}));

export const themeRelations = relations(themes, ({ many }) => ({
  invites: many(invites),
  purchases: many(purchases),
}));

export const inviteRelations = relations(invites, ({ one, many }) => ({
  creator: one(users, { fields: [invites.creatorId], references: [users.id] }),
  theme: one(themes, { fields: [invites.themeId], references: [themes.id] }),
  timeSlots: many(inviteTimeSlots),
  answer: one(answers),
  linkedGroups: many(linkedGroups),
}));

export const inviteTimeSlotRelations = relations(inviteTimeSlots, ({ one }) => ({
  invite: one(invites, { fields: [inviteTimeSlots.inviteId], references: [invites.id] }),
}));

export const answerRelations = relations(answers, ({ one }) => ({
  invite: one(invites, { fields: [answers.inviteId], references: [invites.id] }),
  timeSlot: one(inviteTimeSlots, { fields: [answers.timeSlotId], references: [inviteTimeSlots.id] }),
}));

export const linkedGroupRelations = relations(linkedGroups, ({ one }) => ({
  invite: one(invites, { fields: [linkedGroups.inviteId], references: [invites.id] }),
}));

export const purchaseRelations = relations(purchases, ({ one }) => ({
  user: one(users, { fields: [purchases.userId], references: [users.id] }),
  theme: one(themes, { fields: [purchases.themeId], references: [themes.id] }),
}));

export * from "./user.table";
export * from "./theme.table";
export * from "./invite.table";
export * from "./invite-time-slot.table";
export * from "./answer.table";
export * from "./linked-group.table";
export * from "./purchase.table";
export * from "./rate-limit-hit.table";
