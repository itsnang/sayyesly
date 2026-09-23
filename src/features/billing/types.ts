import type { PurchaseStatus } from "@/lib/db/schema";

export type CheckoutResult = {
  error?: string;
  /** Already free or owned: nothing to pay */
  owned?: boolean;
  purchaseId?: string;
  qrImageUrl?: string;
  checkoutUrl?: string | null;
  expiresAt?: string;
  amountCents?: number;
};

export type PurchaseStatusResult = { error?: string; status?: PurchaseStatus };

export type ThemeForSale = {
  id: string;
  name: string;
  priceCents: number;
  owned: boolean;
};
