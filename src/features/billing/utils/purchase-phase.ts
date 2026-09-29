import { PurchaseStatus, type EnumValue } from "@/lib/enums";

/** Where buying a Theme is, as the checkout shows it. */
export const PurchasePhase = {
  Starting: "starting",
  Waiting: "waiting",
  Paid: "paid",
  /** The KHQR code expired before it was paid */
  Lapsed: "lapsed",
  Failed: "failed",
  Error: "error",
} as const;
export type PurchasePhase = EnumValue<typeof PurchasePhase>;

/** Whether the Purchase is decided, so there's nothing left to poll for. */
export function isPurchaseSettled(status: PurchaseStatus | undefined): boolean {
  return status === PurchaseStatus.Paid || status === PurchaseStatus.Failed || status === PurchaseStatus.Expired;
}

/**
 * The phase while a KHQR code is out, from the status our database reports
 * (only CutLuy's webhook changes it) and whether the code's countdown has run
 * out. Paid wins over the countdown: they may have paid in the last second.
 */
export function waitingPhase(status: PurchaseStatus | undefined, qrExpired: boolean): PurchasePhase {
  if (status === PurchaseStatus.Paid) return PurchasePhase.Paid;
  if (status === PurchaseStatus.Failed) return PurchasePhase.Failed;
  if (status === PurchaseStatus.Expired || qrExpired) return PurchasePhase.Lapsed;
  return PurchasePhase.Waiting;
}
