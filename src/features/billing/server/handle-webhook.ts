import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { CutluyEvent, CutluyPaymentStatus, cutluyPaymentSchema } from "@/lib/cutluy/client";
import { db } from "@/lib/db";
import { purchases } from "@/lib/db/schema";
import { PurchaseStatus } from "@/lib/enums";
import { isId } from "@/lib/validation";
import { amountMatchesCents } from "../utils/cutluy-webhook";
import { logger } from "@/lib/logger";

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
    logger.warn("cutluy_webhook.payment_id_mismatch", { purchaseId: purchase.id });
    return { status: 200, message: "payment id mismatch" };
  }

  switch (type) {
    case CutluyEvent.Completed: {
      if (payment.status !== CutluyPaymentStatus.Paid || payment.currency !== "USD" || !amountMatchesCents(payment.amount, purchase.amountCents)) {
        logger.warn("cutluy_webhook.amount_mismatch", { purchaseId: purchase.id, status: payment.status, currency: payment.currency });
        return { status: 200, message: "amount mismatch; not unlocked" };
      }
      try {
        await db
          .update(purchases)
          .set({ status: PurchaseStatus.Paid, paidAt: new Date(), cutluyPaymentId: payment.id, updatedAt: new Date() })
          .where(and(eq(purchases.id, purchase.id), ne(purchases.status, PurchaseStatus.Paid)));
      } catch (error) {
        // The one-paid-purchase-per-theme index: this Creator already owns the Theme (paid twice).
        logger.error("cutluy_webhook.second_paid_purchase", error, { purchaseId: purchase.id });
      }
      return { status: 200, message: "paid" };
    }
    case CutluyEvent.Expired:
    case CutluyEvent.Failed: {
      await db
        .update(purchases)
        .set({ status: type === CutluyEvent.Expired ? PurchaseStatus.Expired : PurchaseStatus.Failed, updatedAt: new Date() })
        .where(and(eq(purchases.id, purchase.id), eq(purchases.status, PurchaseStatus.Pending)));
      return { status: 200, message: "closed" };
    }
    default:
      // e.g. payment.scanned: nothing to record.
      return { status: 200, message: "ignored" };
  }
}
