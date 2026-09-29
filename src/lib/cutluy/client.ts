import "server-only";
import { z } from "zod";
import { requireEnv } from "@/env";
import { enumValues, type EnumValue } from "@/lib/enums";

// CutLuy KHQR payments API: https://cutluy.com/docs
const API_BASE = "https://cutluy.com/v1";

/** A CutLuy payment's status, as its API and webhooks send it. */
export const CutluyPaymentStatus = { Pending: "pending", Scanned: "scanned", Paid: "paid", Expired: "expired", Failed: "failed" } as const;
export type CutluyPaymentStatus = EnumValue<typeof CutluyPaymentStatus>;

/** The webhook events CutLuy sends (https://cutluy.com/docs). */
export const CutluyEvent = {
  Completed: "payment.completed",
  Expired: "payment.expired",
  Failed: "payment.failed",
  Scanned: "payment.scanned",
} as const;

export const cutluyPaymentSchema = z.object({
  id: z.string(),
  status: z.enum(enumValues(CutluyPaymentStatus)),
  amount: z.string(),
  currency: z.string(),
  reference_id: z.string().nullable(),
  qr_string: z.string().optional(),
  checkout_url: z.string().optional(),
  expires_at: z.string().optional(),
});

export type CutluyPayment = z.infer<typeof cutluyPaymentSchema>;

export class CutluyError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Creates a KHQR payment. `amount` is in US dollars (min 0.01). Retrying with
 * the same `idempotencyKey` returns the original payment instead of a new one.
 */
export async function createPayment(input: {
  amount: number;
  referenceId: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}): Promise<CutluyPayment> {
  const res = await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv("CUTLUY_API_KEY")}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      amount: input.amount,
      reference_id: input.referenceId,
      ...(input.metadata ? { metadata: input.metadata } : {}),
    }),
    cache: "no-store",
  });

  const body = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
  if (!res.ok) {
    throw new CutluyError(res.status, body?.error ?? "unknown", body?.message ?? res.statusText);
  }
  return cutluyPaymentSchema.parse(body);
}

/** The branded KHQR card for a payment's `qr_string`, rendered by CutLuy (no API key needed). */
export function khqrImageUrl(qrString: string): string {
  return `https://cutluy.com/api/render/khqr/${encodeURIComponent(qrString)}.svg`;
}
