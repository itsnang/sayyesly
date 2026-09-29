import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { enumValues, TimeOfDay } from "../../enums";
import { themes } from "./theme.table";
import { users } from "./user.table";

// Which part of the day the Invite is for; sets the times offered around it.
export const timeOfDayEnum = pgEnum("time_of_day", enumValues(TimeOfDay));

export type PlanPhoto = {
  url: string;
  alt: string;
  caption?: string;
};

export const invites = pgTable(
  "invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Public share link: /invite/<slug>
    slug: text("slug").notNull().unique(),
    // Secret code for attaching a Linked group with `/link <code>`
    linkCode: text("link_code").notNull().unique(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    themeId: text("theme_id")
      .notNull()
      .references(() => themes.id, { onDelete: "restrict" }),
    recipientName: text("recipient_name").notNull(),
    // Wrap the word to emphasise in asterisks: "will you have *dinner* with me?"
    question: text("question").notNull(),
    message: text("message"),
    imageUrl: text("image_url"),
    planPlace: text("plan_place"),
    planActivity: text("plan_activity"),
    planMapUrl: text("plan_map_url"),
    planDressCode: text("plan_dress_code"),
    planNotes: text("plan_notes"),
    planPhotos: jsonb("plan_photos").$type<PlanPhoto[]>().notNull().default([]),
    // The Song: a canonical YouTube watch link (see recognizeSong), or null
    songUrl: text("song_url"),
    // The part of the Song that plays, repeating: from this second, for 15, 30 or 60 seconds
    songStart: integer("song_start").notNull().default(0),
    songLength: integer("song_length").notNull().default(30),
    // IANA zone that Time slots and Custom times are shown and entered in
    timezone: text("timezone").notNull().default("Asia/Phnom_Penh"),
    allowCustomTime: boolean("allow_custom_time").notNull().default(false),
    timeOfDay: timeOfDayEnum("time_of_day").notNull().default(TimeOfDay.Evening),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("invites_creator_id_idx").on(t.creatorId)],
);

export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;
