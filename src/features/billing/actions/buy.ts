"use server";

import { and, desc, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createPayment, khqrImageUrl } from "@/lib/cutluy/client";
import { db } from "@/lib/db";
import { themeAccess } from "@/lib/db/queries";
import { purchases, themes, type Purchase } from "@/lib/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { isThemeUsable } from "@/lib/theme-access";
import { idSchema } from "@/lib/validation";
import type { CheckoutResult, PurchaseStatusResult } from "../types";
import { centsToDollars } from "../utils/cutluy-webhook";

const themeIdSchema = z.string().regex(/^[a-z0-9-]{1,64}$/);

function ticket(p: Purchase): CheckoutResult {
  return {
    purchaseId: p.id,
    qrImageUrl: khqrImageUrl(p.qrString!),
    checkoutUrl: p.checkoutUrl,
    expiresAt: p.expiresAt!.toISOString(),
    amountCents: p.amountCents,
  };
}

/**
 * Starts (or resumes) buying a Paid theme. The price always comes from the
 * `themes` row on the server; the Theme only unlocks when CutLuy's verified
 * webhook marks the Purchase paid, never from anything the browser says.
 */
export async function buyTheme(themeId: string): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (!themeIdSchema.safeParse(themeId).success) return { error: "Unknown theme." };
  if (!rateLimit(`buy:${user.id}`, 6, 60_000)) return { error: "Too many tries. Please wait a minute." };

  // Independent reads, so they share one round trip's worth of waiting.
  const [theme, access] = await Promise.all([
    db.query.themes.findFirst({ where: eq(themes.id, themeId) }),
    themeAccess(user.id),
  ]);
  if (!theme?.isActive) return { error: "That theme isn't available." };
  // Free, already owned, or a Tester: nothing to pay.
  if (isThemeUsable(theme, access)) return { owned: true };

  // One checkout at a time per Creator and Theme: a second tap waits here, then
  // finds the first tap's still-valid QR instead of creating another payment.
  return db.transaction(async (tx): Promise<CheckoutResult> => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`buy:${user.id}:${themeId}`}))`);

    const pending = await tx.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, user.id),
        eq(purchases.themeId, themeId),
        eq(purchases.status, "pending"),
        gt(purchases.expiresAt, new Date(Date.now() + 30_000)),
      ),
      orderBy: desc(purchases.createdAt),
    });
    if (pending?.qrString && pending.expiresAt) return ticket(pending);

    const [purchase] = await tx
      .insert(purchases)
      .values({ userId: user.id, themeId, amountCents: theme.priceCents })
      .returning();
    if (!purchase) return { error: "Couldn't start the payment. Please try again." };

    const payment = await createPayment({
      amount: centsToDollars(purchase.amountCents),
      referenceId: purchase.id,
      idempotencyKey: purchase.id,
      metadata: { theme_id: themeId },
    }).catch((error: unknown) => {
      console.error("CutLuy create payment failed", error);
      return null;
    });

    if (!payment?.qr_string) {
      await tx.update(purchases).set({ status: "failed", updatedAt: new Date() }).where(eq(purchases.id, purchase.id));
      return { error: "The payment service didn't respond. Please try again in a moment." };
    }

    const [ready] = await tx
      .update(purchases)
      .set({
        cutluyPaymentId: payment.id,
        qrString: payment.qr_string,
        checkoutUrl: payment.checkout_url ?? null,
        expiresAt: payment.expires_at ? new Date(payment.expires_at) : new Date(Date.now() + 5 * 60_000),
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, purchase.id))
      .returning();
    return ready ? ticket(ready) : { error: "Couldn't start the payment. Please try again." };
  });
}

/** Polled by the checkout screen. Reads our database only; the webhook is what changes it. */
export async function getPurchaseStatus(purchaseId: string): Promise<PurchaseStatusResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (!idSchema.safeParse(purchaseId).success) return { error: "Unknown payment." };

  const purchase = await db.query.purchases.findFirst({
    where: and(eq(purchases.id, purchaseId), eq(purchases.userId, user.id)),
    columns: { status: true, expiresAt: true },
  });
  if (!purchase) return { error: "Unknown payment." };

  const lapsed = purchase.status === "pending" && !!purchase.expiresAt && purchase.expiresAt.getTime() < Date.now();
  return { status: lapsed ? "expired" : purchase.status };
}
