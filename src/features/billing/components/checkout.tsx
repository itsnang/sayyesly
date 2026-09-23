"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, buttonClass, Eyebrow, Note } from "@/components/shared/ui";
import { formatUsd } from "@/lib/format";
import { buyTheme, getPurchaseStatus } from "../actions";
import type { CheckoutResult } from "../types";

type Ticket = { purchaseId: string; qrImageUrl: string; checkoutUrl: string | null; expiresAt: string; amountCents: number };

function toTicket(result: CheckoutResult): Ticket | null {
  const { purchaseId, qrImageUrl, expiresAt, amountCents } = result;
  if (!purchaseId || !qrImageUrl || !expiresAt || amountCents === undefined) return null;
  return { purchaseId, qrImageUrl, expiresAt, amountCents, checkoutUrl: result.checkoutUrl ?? null };
}

function useCountdown(until: string | null) {
  const left = () => (until ? Math.max(0, new Date(until).getTime() - Date.now()) : 0);
  const [ms, setMs] = useState(left);
  useEffect(() => {
    if (!until) return;
    const tick = () => setMs(Math.max(0, new Date(until).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);
  const s = Math.ceil(ms / 1000);
  return { expired: !!until && ms === 0, label: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` };
}

type Phase = "starting" | "waiting" | "paid" | "lapsed" | "failed" | "error";

/**
 * Buying one Paid theme, start to finish: creates (or resumes) the CutLuy
 * payment, shows the KHQR code, and waits for the verified webhook to mark
 * it paid. The browser only ever asks our server for the status.
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
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("starting");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const countdown = useCountdown(ticket?.expiresAt ?? null);
  const paidOnce = useRef(false);

  const markPaid = useCallback(() => {
    setPhase("paid");
    if (paidOnce.current) return;
    paidOnce.current = true;
    onPaid?.();
    router.refresh();
  }, [onPaid, router]);

  const applyResult = useCallback(
    (result: CheckoutResult) => {
      if (result.owned) return markPaid();
      const next = result.error ? null : toTicket(result);
      if (!next) {
        setError(result.error ?? "Couldn't start the payment. Please try again.");
        setPhase("error");
        return;
      }
      setTicket(next);
      setPhase("waiting");
    },
    [markPaid],
  );

  const requestPayment = useCallback(
    () => buyTheme(theme.id).catch((): CheckoutResult => ({ error: "Couldn't reach the server. Check your connection." })),
    [theme.id],
  );

  // Ask once per dialog. Without the guard, React's dev double-run of effects
  // sends two requests that queue behind each other on the server's lock.
  const requested = useRef(false);
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    void requestPayment().then(applyResult);
  }, [requestPayment, applyResult]);

  function retry() {
    setPhase("starting");
    setError(null);
    void requestPayment().then(applyResult);
  }

  // The QR stops being payable at its expiry, even before the webhook says so.
  const shown: Phase = phase === "waiting" && countdown.expired ? "lapsed" : phase;

  // Poll our own database; only CutLuy's signed webhook changes it.
  useEffect(() => {
    if (shown !== "waiting" || !ticket) return;
    const id = setInterval(async () => {
      const result = await getPurchaseStatus(ticket.purchaseId).catch(() => null);
      if (result?.status === "paid") markPaid();
      else if (result?.status === "failed") setPhase("failed");
      else if (result?.status === "expired") setPhase("lapsed");
    }, 2500);
    return () => clearInterval(id);
  }, [shown, ticket, markPaid]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 sm:items-center sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="w-full max-w-[380px] rounded-t-[10px] border-[1.5px] border-ink bg-card sm:rounded-[8px] sm:shadow-[6px_6px_0_var(--color-ink)]"
      >
        {/* Receipt header */}
        <div className="flex items-start justify-between gap-3 border-b-[1.5px] border-dashed border-ink/30 px-5 pt-5 pb-4">
          <div>
            <Eyebrow>Theme · pay once</Eyebrow>
            <h2 id="checkout-title" className="mt-1 font-display text-[26px] leading-tight text-ink">
              {theme.name}
            </h2>
          </div>
          <p className="pt-5 text-[18px] font-bold text-ink">{formatUsd(ticket?.amountCents ?? theme.priceCents)}</p>
        </div>

        <div className="px-5 pt-5 pb-5 text-center">
          {shown === "starting" && (
            <div className="grid place-items-center py-12" aria-live="polite">
              <span className="size-8 animate-spin rounded-[4px] border-[2.5px] border-ink border-t-rose" aria-hidden />
              <p className="mt-4 text-[14px] text-muted">Making your KHQR code…</p>
            </div>
          )}

          {shown === "waiting" && ticket && (
            <>
              <p className="text-[14.5px] text-ink">Scan with any KHQR banking app (ABA, ACLEDA, Wing…)</p>
              {/* CutLuy's branded KHQR card (merchant + amount read from the payload); never shown once the payment is over */}
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG rendered by CutLuy */}
              <img
                src={ticket.qrImageUrl}
                alt={`KHQR code. Scan to pay ${formatUsd(ticket.amountCents)}`}
                width={360}
                className="mx-auto mt-4 h-auto w-full max-w-[280px] drop-shadow-[3px_3px_0_var(--color-ink)]"
              />
              <p className="mt-4 flex items-center justify-center gap-2 text-[12.5px] text-muted" aria-live="polite">
                <span aria-hidden className="size-2 animate-pulse bg-rose" />
                Waiting for payment · {countdown.label}
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

          {shown === "paid" && (
            <div className="py-4">
              <p className="inline-block -rotate-3 rounded-[4px] border-[2.5px] border-emerald-800 px-3 py-1 text-[20px] font-bold tracking-[0.1em] text-emerald-800 uppercase">
                Paid ✓
              </p>
              <p className="mt-4 text-[15px] text-ink">{theme.name} is yours. Use it on any invite.</p>
              <Button className="mt-6 w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          )}

          {(shown === "lapsed" || shown === "failed" || shown === "error") && (
            <div className="py-2">
              <Note tone={shown === "error" ? "error" : "info"} className="text-left">
                {shown === "error"
                  ? error
                  : shown === "failed"
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
