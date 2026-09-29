import type { PurchaseStatus } from "@/lib/enums";

export type CheckoutResult = {
  error?: string;
  /** Already usable (free, owned, or the Creator is a Tester): nothing to pay */
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
  /** The Creator can already use it (free, owned, or they're a Tester), so it isn't for sale to them */
  usable: boolean;
};
