"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button } from "@/components/shared/ui";
import { buyTheme } from "../actions";
import type { CheckoutResult, ThemeForSale } from "../types";
import { Checkout } from "./checkout";

const price = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function ThemeShop({ themes }: { themes: ThemeForSale[] }) {
  const [buying, setBuying] = useState<{ theme: ThemeForSale; ticket: CheckoutResult } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(theme: ThemeForSale) {
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
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {themes.map((theme) => (
          <li key={theme.id} className="rounded-2xl border-2 border-[var(--line)]/40 bg-[var(--paper)] p-4">
            <div className="flex items-center gap-2">
              <span className="text-[17px] text-[var(--ink)]">{theme.name}</span>
              {theme.owned ? (
                <Badge tone="green">{theme.priceCents === 0 ? "free" : "yours"}</Badge>
              ) : (
                <Badge tone="pink">{price(theme.priceCents)}</Badge>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/demo?theme=${encodeURIComponent(theme.id)}`}
                target="_blank"
                className="rounded-xl border-2 border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)] hover:bg-[var(--paper-2)]"
              >
                try it ↗
              </Link>
              {!theme.owned && (
                <Button onClick={() => start(theme)} disabled={busyId !== null}>
                  {busyId === theme.id ? "starting…" : `buy for ${price(theme.priceCents)}`}
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
