"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/shared/ui";
import { formatUsd } from "@/lib/format";
import { buyTheme } from "../actions";
import type { CheckoutResult, ThemeForSale } from "../types";
import { Checkout } from "./checkout";

export type ThemeForShop = ThemeForSale & { thumbnail: string };

export function ThemeShop({ themes }: { themes: ThemeForShop[] }) {
  const [buying, setBuying] = useState<{ theme: ThemeForShop; ticket: CheckoutResult } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(theme: ThemeForShop) {
    setBusyId(theme.id);
    setError(null);
    const ticket = await buyTheme(theme.id).catch(() => ({ error: "Couldn't reach the server." }) as CheckoutResult);
    setBusyId(null);
    if (ticket.error) setError(ticket.error);
    else if (ticket.purchaseId) setBuying({ theme, ticket });
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </p>
      )}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {themes.map((theme) => (
          <li key={theme.id} className="rounded-[18px] border border-ink/12 bg-card p-2.5">
            <span className="relative block aspect-[4/5] overflow-hidden rounded-[12px] bg-surface">
              {theme.thumbnail && <Image src={theme.thumbnail} alt="" fill sizes="240px" className="object-cover object-[50%_32%]" />}
            </span>
            <div className="mt-3 flex items-baseline justify-between px-1">
              <span className="text-[15px] font-medium text-ink">{theme.name}</span>
              <span className="font-mono text-[12.5px] text-muted">
                {theme.owned ? (theme.priceCents === 0 ? "free" : "yours ✓") : formatUsd(theme.priceCents)}
              </span>
            </div>
            <div className="mt-3 flex gap-2 px-1 pb-1">
              <Link
                href={`/demo?theme=${encodeURIComponent(theme.id)}`}
                target="_blank"
                className="rounded-full border border-ink/20 px-3 py-1.5 text-[13px] text-ink hover:border-ink"
              >
                Try it
              </Link>
              {!theme.owned && (
                <Button className="!px-3.5 !py-1.5 !text-[13px]" onClick={() => start(theme)} disabled={busyId !== null}>
                  {busyId === theme.id ? "Starting…" : `Buy ${formatUsd(theme.priceCents)}`}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {buying?.ticket.purchaseId && buying.ticket.qrImageUrl && buying.ticket.expiresAt && buying.ticket.amountCents !== undefined && (
        <Checkout
          key={buying.ticket.purchaseId}
          themeName={buying.theme.name}
          ticket={{
            purchaseId: buying.ticket.purchaseId,
            qrImageUrl: buying.ticket.qrImageUrl,
            expiresAt: buying.ticket.expiresAt,
            amountCents: buying.ticket.amountCents,
            checkoutUrl: buying.ticket.checkoutUrl ?? null,
          }}
          onClose={() => setBuying(null)}
          onRetry={() => {
            const theme = buying.theme;
            setBuying(null);
            void start(theme);
          }}
        />
      )}
    </>
  );
}
