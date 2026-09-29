// The domain's fixed sets of values, as enum-style constants: write
// `AnswerKind.Yes` in code, while the value stays the plain string ("yes") that
// the database, zod and JSON use, so rows and requests fit the type without a
// cast. Each one feeds its Postgres enum (lib/db/schema) and zod schema, so
// there is a single list of values. No Drizzle here: client components import it.

/** One enum's values, e.g. `EnumValue<typeof AnswerKind>` is "yes" | "maybe_later". */
export type EnumValue<E extends Record<string, string | number>> = E[keyof E];

/** An enum's values as the non-empty tuple `pgEnum` and `z.enum` take, in declaration order. */
export function enumValues<E extends Record<string, string>>(e: E): [EnumValue<E>, ...EnumValue<E>[]] {
  return Object.values(e) as [EnumValue<E>, ...EnumValue<E>[]];
}

/** The Recipient's Answer: Yes (with a time) or Maybe later. There is deliberately no "No". */
export const AnswerKind = { Yes: "yes", MaybeLater: "maybe_later" } as const;
export type AnswerKind = EnumValue<typeof AnswerKind>;

/** Where one Purchase is: a KHQR payment waiting, paid (the Theme is owned), expired or failed. */
export const PurchaseStatus = { Pending: "pending", Paid: "paid", Expired: "expired", Failed: "failed" } as const;
export type PurchaseStatus = EnumValue<typeof PurchaseStatus>;

/** Which Part of the day an Invite is for. */
export const TimeOfDay = { Morning: "morning", Lunch: "lunch", Afternoon: "afternoon", Evening: "evening" } as const;
export type TimeOfDay = EnumValue<typeof TimeOfDay>;
