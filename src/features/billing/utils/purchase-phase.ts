import type { PurchaseStatus } from "@/lib/db/schema";

/** Where buying a Theme is, as the checkout shows it. */
export type PurchasePhase = "starting" | "waiting" | "paid" | "lapsed" | "failed" | "error";

/** Whether the Purchase is decided, so there's nothing left to poll for. */
export function isPurchaseSettled(status: PurchaseStatus | undefined): boolean {
  return status === "paid" || status === "failed" || status === "expired";
}

/**
 * The phase while a KHQR code is out, from the status our database reports
 * (only CutLuy's webhook changes it) and whether the code's countdown has run
 * out. Paid wins over the countdown: they may have paid in the last second.
 */
export function waitingPhase(status: PurchaseStatus | undefined, qrExpired: boolean): PurchasePhase {
  if (status === "paid") return "paid";
  if (status === "failed") return "failed";
  if (status === "expired" || qrExpired) return "lapsed";
  return "waiting";
}
