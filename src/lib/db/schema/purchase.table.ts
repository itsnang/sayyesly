import { sql } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { themes } from "./theme.table";
import { users } from "./user.table";

export const purchaseStatusEnum = pgEnum("purchase_status", ["pending", "paid", "expired", "failed"]);

// One attempt to buy a Paid theme, mapped one-to-one to a CutLuy payment.
// `amountCents` is copied from the Theme on the server when the attempt starts.
export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    themeId: text("theme_id")
      .notNull()
      .references(() => themes.id, { onDelete: "restrict" }),
    amountCents: integer("amount_cents").notNull(),
    status: purchaseStatusEnum("status").notNull().default("pending"),
    cutluyPaymentId: text("cutluy_payment_id").unique(),
    qrString: text("qr_string"),
    checkoutUrl: text("checkout_url"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("purchases_user_theme_idx").on(t.userId, t.themeId),
    // A Creator owns a Theme through at most one paid Purchase
    uniqueIndex("purchases_one_paid_per_theme")
      .on(t.userId, t.themeId)
      .where(sql`${t.status} = 'paid'`),
  ],
);

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type PurchaseStatus = (typeof purchaseStatusEnum.enumValues)[number];
