"use server";

import { and, desc, eq, gt } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { createPayment, CutluyError, khqrImageUrl } from "@/lib/cutluy/client";
import { db } from "@/lib/db";
import { purchases, themes } from "@/lib/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import type { CheckoutResult, PurchaseStatusResult } from "../types";
import { centsToDollars } from "../utils/cutluy-webhook";

/**
 * Starts (or resumes) buying a Paid theme. The price always comes from the
 * `themes` row on the server; the Theme only unlocks when CutLuy's verified
 * webhook marks the Purchase paid, never from anything the browser says.
 */
export async function buyTheme(themeId: string): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (typeof themeId !== "string" || themeId.length > 64) return { error: "Unknown theme." };
  if (!rateLimit(`buy:${user.id}`, 6, 60_000)) return { error: "Too many tries. Please wait a minute." };

  const theme = await db.query.themes.findFirst({ where: eq(themes.id, themeId) });
  if (!theme?.isActive) return { error: "That theme isn't available." };
  if (theme.priceCents === 0) return { owned: true };

  const owned = await db.query.purchases.findFirst({
    where: and(eq(purchases.userId, user.id), eq(purchases.themeId, themeId), eq(purchases.status, "paid")),
    columns: { id: true },
  });
  if (owned) return { owned: true };

  // Tapping Buy again while the last QR is still valid shows that same QR.
  const pending = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.userId, user.id),
      eq(purchases.themeId, themeId),
      eq(purchases.status, "pending"),
      gt(purchases.expiresAt, new Date(Date.now() + 30_000)),
    ),
    orderBy: desc(purchases.createdAt),
  });
  if (pending?.qrString && pending.expiresAt) {
    return {
      purchaseId: pending.id,
      qrImageUrl: khqrImageUrl(pending.qrString),
      checkoutUrl: pending.checkoutUrl,
      expiresAt: pending.expiresAt.toISOString(),
      amountCents: pending.amountCents,
    };
  }

  const [purchase] = await db
    .insert(purchases)
    .values({ userId: user.id, themeId, amountCents: theme.priceCents })
    .returning();
  if (!purchase) return { error: "Couldn't start the payment. Please try again." };

  try {
    const payment = await createPayment({
      amount: centsToDollars(purchase.amountCents),
      referenceId: purchase.id,
      idempotencyKey: purchase.id,
      metadata: { theme_id: themeId },
    });
    if (!payment.qr_string) throw new CutluyError(502, "no_qr", "CutLuy returned no QR");

    const expiresAt = payment.expires_at ? new Date(payment.expires_at) : new Date(Date.now() + 5 * 60_000);
    await db
      .update(purchases)
      .set({
        cutluyPaymentId: payment.id,
        qrString: payment.qr_string,
        checkoutUrl: payment.checkout_url ?? null,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, purchase.id));

    return {
      purchaseId: purchase.id,
      qrImageUrl: khqrImageUrl(payment.qr_string),
      checkoutUrl: payment.checkout_url ?? null,
      expiresAt: expiresAt.toISOString(),
      amountCents: purchase.amountCents,
    };
  } catch (error) {
    console.error("CutLuy create payment failed", error);
    await db.update(purchases).set({ status: "failed", updatedAt: new Date() }).where(eq(purchases.id, purchase.id));
    return { error: "The payment service didn't respond. Please try again in a moment." };
  }
}

/** Polled by the checkout screen. Reads our database only; the webhook is what changes it. */
export async function getPurchaseStatus(purchaseId: string): Promise<PurchaseStatusResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (typeof purchaseId !== "string" || !/^[0-9a-f-]{36}$/i.test(purchaseId)) return { error: "Unknown payment." };

  const purchase = await db.query.purchases.findFirst({
    where: and(eq(purchases.id, purchaseId), eq(purchases.userId, user.id)),
    columns: { status: true, expiresAt: true },
  });
  if (!purchase) return { error: "Unknown payment." };

  const lapsed = purchase.status === "pending" && !!purchase.expiresAt && purchase.expiresAt.getTime() < Date.now();
  return { status: lapsed ? "expired" : purchase.status };
}
