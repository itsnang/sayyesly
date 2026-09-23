import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { cutluyPaymentSchema } from "@/lib/cutluy/client";
import { db } from "@/lib/db";
import { purchases } from "@/lib/db/schema";
import { isId } from "@/lib/validation";
import { amountMatchesCents } from "../utils/cutluy-webhook";

const eventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({ payment: cutluyPaymentSchema.partial({ qr_string: true, checkout_url: true, expires_at: true }) }),
});

export type WebhookOutcome = { status: number; message: string };

/**
 * Applies one signature-verified CutLuy event. Idempotent: CutLuy retries
 * failed deliveries up to 8 times, and a repeat of an event already applied
 * changes nothing.
 */
export async function handleCutluyEvent(body: unknown): Promise<WebhookOutcome> {
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return { status: 400, message: "unrecognised event" };
  const { type, data } = parsed.data;
  const payment = data.payment;

  if (!payment.reference_id || !isId(payment.reference_id)) {
    return { status: 200, message: "not one of ours" };
  }
  const purchase = await db.query.purchases.findFirst({ where: eq(purchases.id, payment.reference_id) });
  if (!purchase) return { status: 200, message: "unknown purchase" };
  // The event must be about the CutLuy payment we created for this Purchase.
  if (purchase.cutluyPaymentId && purchase.cutluyPaymentId !== payment.id) {
    console.error("CutLuy payment id mismatch", purchase.id, payment.id);
    return { status: 200, message: "payment id mismatch" };
  }

  switch (type) {
    case "payment.completed": {
      if (payment.status !== "paid" || payment.currency !== "USD" || !amountMatchesCents(payment.amount, purchase.amountCents)) {
        console.error("CutLuy paid event doesn't match purchase", purchase.id, payment.status, payment.amount, payment.currency);
        return { status: 200, message: "amount mismatch; not unlocked" };
      }
      try {
        await db
          .update(purchases)
          .set({ status: "paid", paidAt: new Date(), cutluyPaymentId: payment.id, updatedAt: new Date() })
          .where(and(eq(purchases.id, purchase.id), ne(purchases.status, "paid")));
      } catch (error) {
        // The one-paid-purchase-per-theme index: this Creator already owns the Theme (paid twice).
        console.error("Second paid purchase for an owned theme; needs a refund", purchase.id, error);
      }
      return { status: 200, message: "paid" };
    }
    case "payment.expired":
    case "payment.failed": {
      await db
        .update(purchases)
        .set({ status: type === "payment.expired" ? "expired" : "failed", updatedAt: new Date() })
        .where(and(eq(purchases.id, purchase.id), eq(purchases.status, "pending")));
      return { status: 200, message: "closed" };
    }
    default:
      // e.g. payment.scanned: nothing to record.
      return { status: 200, message: "ignored" };
  }
}
