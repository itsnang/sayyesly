// Which part of the day an Invite is for. Kept apart from the database schema
// so client components (Themes, the editor) can import it without Drizzle.
export const TIMES_OF_DAY = ["morning", "lunch", "afternoon", "evening"] as const;
export type TimeOfDay = (typeof TIMES_OF_DAY)[number];
