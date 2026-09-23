"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/ui";
import { getPurchaseStatus } from "../actions";
import type { CheckoutResult } from "../types";

const price = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function useCountdown(until: string) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(until).getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, new Date(until).getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [until]);
  const s = Math.ceil(left / 1000);
  return { expired: left === 0, label: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` };
}

type Ticket = Required<Pick<CheckoutResult, "purchaseId" | "qrImageUrl" | "expiresAt" | "amountCents">> & {
  checkoutUrl: string | null;
};

/** The KHQR code to scan, waiting for CutLuy's webhook to confirm payment. */
export function Checkout({ ticket, themeName, onClose, onRetry }: {
  ticket: Ticket;
  themeName: string;
  onClose: () => void;
  onRetry: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("pending");
  const countdown = useCountdown(ticket.expiresAt);

  useEffect(() => {
    if (status === "paid" || status === "failed" || status === "expired") return;
    const id = setInterval(async () => {
      const result = await getPurchaseStatus(ticket.purchaseId).catch(() => null);
      if (result?.status) setStatus(result.status);
    }, 3000);
    return () => clearInterval(id);
  }, [status, ticket.purchaseId]);

  useEffect(() => {
    if (status === "paid") router.refresh();
  }, [status, router]);

  const lapsed = status === "expired" || (countdown.expired && status === "pending");

  return (
    <div role="dialog" aria-modal="true" aria-label={`Buy ${themeName}`} className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--paper)] p-5 text-center shadow-xl">
        {status === "paid" ? (
          <>
            <p className="font-[family-name:var(--hand)] text-4xl text-[var(--ink)]">unlocked ✓</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{themeName} is yours. Pick it on any invite.</p>
            <Button className="mt-5 w-full" onClick={onClose}>
              lovely
            </Button>
          </>
        ) : lapsed || status === "failed" ? (
          <>
            <p className="text-lg text-[var(--ink)]">{status === "failed" ? "That payment didn't go through." : "This QR code expired."}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">No money was taken. You can try again.</p>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                close
              </Button>
              <Button className="flex-1" onClick={onRetry}>
                new QR code
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[15px] text-[var(--ink)]">
              Scan with any KHQR banking app to pay <b>{price(ticket.amountCents)}</b>
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG rendered by CutLuy */}
            <img src={ticket.qrImageUrl} alt="KHQR payment code" className="mx-auto mt-4 w-full max-w-[260px] rounded-xl bg-white" />
            {ticket.checkoutUrl && (
              <a href={ticket.checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-[var(--accent)] underline">
                paying on this phone? open checkout ↗
              </a>
            )}
            <p className="mt-3 text-xs text-[var(--ink-soft)]" aria-live="polite">
              {status === "scanned" ? "Scanned. Confirm in your banking app…" : `Waiting for payment · expires in ${countdown.label}`}
            </p>
            <Button variant="ghost" className="mt-3" onClick={onClose}>
              cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
