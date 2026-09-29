"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Button, buttonClass, Note } from "@/components/shared/ui";
import { formatUsd } from "@/lib/format";
import { track } from "@/lib/analytics/track";
import { useThemePurchase } from "../hooks/use-theme-purchase";
import { PurchasePhase } from "../utils/purchase-phase";

/**
 * Buying one Paid theme: shows the KHQR code from `useThemePurchase` and each
 * step after it. The browser only ever asks our server for the status.
 */
export function BuyThemeDialog({
  theme,
  onClose,
  onPaid,
}: {
  theme: { id: string; name: string; priceCents: number };
  onClose: () => void;
  /** Called once the Purchase is paid (or the Theme turned out to be owned already) */
  onPaid?: () => void;
}) {
  const { phase: shown, ticket, countdown, error, retry } = useThemePurchase(theme.id, onPaid);

  // Once per opening of the checkout.
  useEffect(() => track("checkout_opened", { theme: theme.id }), [theme.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 sm:items-center sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[16px] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_24px_60px_-20px_rgba(35,27,23,0.35)] sm:max-w-[380px] sm:rounded-[10px] sm:border sm:border-ink/10 sm:pb-0"
      >
        <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-ink/15 sm:hidden" />
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 pt-4 pb-4 sm:pt-5">
          <div className="min-w-0">
            <p className="text-[12px] text-muted">Pay once to unlock</p>
            <h2 id="checkout-title" className="mt-0.5 truncate text-[17px] font-semibold text-ink">
              {theme.name}
            </h2>
          </div>
          <p className="pt-4 text-[17px] font-semibold text-ink">{formatUsd(ticket?.amountCents ?? theme.priceCents)}</p>
        </div>

        <div className="px-5 pt-5 pb-5 text-center">
          {shown === PurchasePhase.Starting && (
            <div className="grid place-items-center py-12" aria-live="polite">
              <span className="size-6 animate-spin rounded-full border-2 border-ink/15 border-t-ink" aria-hidden />
              <p className="mt-4 text-[13.5px] text-muted">Making your KHQR code…</p>
            </div>
          )}

          {shown === PurchasePhase.Waiting && ticket && (
            <>
              <p className="text-[13.5px] text-muted">Scan with any KHQR banking app (ABA, ACLEDA, Wing…)</p>
              {/* CutLuy's own branded card (merchant + amount read from the payload); never shown once the payment is over.
                  It's an SVG from an external host, so it's unoptimized rather than added to remotePatterns (Next's own
                  guidance: don't run untrusted external SVGs through the image optimiser). */}
              <div className="mx-auto mt-4 max-w-[260px] overflow-hidden rounded-[10px] border border-ink/10">
                <Image
                  src={ticket.qrImageUrl}
                  alt={`KHQR code. Scan to pay ${formatUsd(ticket.amountCents)}`}
                  width={360}
                  height={360}
                  unoptimized
                  className="block h-auto w-full"
                />
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-[12.5px] text-muted" aria-live="polite">
                <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-rose" />
                Waiting for payment · {countdown}
              </p>
              {ticket.checkoutUrl && (
                <a href={ticket.checkoutUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "md", "mt-5 w-full")}>
                  On this phone? Open the pay page ↗
                </a>
              )}
              <Button variant="ghost" size="sm" className="mt-2" onClick={onClose}>
                Cancel
              </Button>
            </>
          )}

          {shown === PurchasePhase.Paid && (
            <div className="py-4">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-emerald-50 text-emerald-800">
                <svg viewBox="0 0 16 16" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.5 8.5l3 3 6-7" />
                </svg>
              </span>
              <p className="mt-3 text-[15px] font-medium text-ink">Paid</p>
              <p className="mt-1 text-[13.5px] text-muted">{theme.name} is yours. Use it on any invite.</p>
              <Button className="mt-6 w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          )}

          {(shown === PurchasePhase.Lapsed || shown === PurchasePhase.Failed || shown === PurchasePhase.Error) && (
            <div className="py-2">
              <Note tone={shown === PurchasePhase.Error ? "error" : "info"} className="text-left">
                {shown === PurchasePhase.Error
                  ? error
                  : shown === PurchasePhase.Failed
                    ? "That payment didn't go through. No money was taken."
                    : "This QR code expired. No money was taken."}
              </Note>
              <div className="mt-5 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button className="flex-1" onClick={retry}>
                  Try again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
