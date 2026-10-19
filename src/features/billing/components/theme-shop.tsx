"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonClass, SalePrice, Stamp } from "@/components/shared/ui";
import { formatUsd, isOnSale, percentOff } from "@/lib/format";
import type { ThemeForSale } from "../types";
import { BuyThemeDialog } from "./checkout";

export type ThemeForShop = ThemeForSale & { thumbnail: string };

export function ThemeShop({ themes }: { themes: ThemeForShop[] }) {
  const [buying, setBuying] = useState<ThemeForShop | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {themes.map((theme) => (
          <li key={theme.id} className="flex flex-col rounded-[8px] border-[1.5px] border-ink bg-card p-2">
            <span className="relative block aspect-[4/5] overflow-hidden rounded-[4px] border-[1.5px] border-ink bg-surface">
              {theme.thumbnail && <Image src={theme.thumbnail} alt="" fill sizes="240px" className="object-cover object-[50%_32%]" />}
              {isOnSale(theme) ? (
                <Stamp tone="rose" className="absolute top-2 left-2 bg-card">
                  {percentOff(theme)}% off
                </Stamp>
              ) : (
                theme.usable && (
                  <Stamp tone={theme.priceCents === 0 ? "ink" : "green"} className="absolute top-2 left-2 bg-card">
                    {theme.priceCents === 0 ? "Free" : "Yours"}
                  </Stamp>
                )
              )}
            </span>
            <div className="mt-3 flex items-baseline justify-between gap-2 px-1">
              <span className="truncate text-[15px] font-medium text-ink">{theme.name}</span>
              {(!theme.usable || isOnSale(theme)) && <SalePrice price={theme} className="shrink-0 text-[13px] font-bold text-ink" />}
            </div>
            <div className="mt-3 grid gap-1.5 px-1 pb-1">
              {!theme.usable && (
                <Button size="sm" onClick={() => setBuying(theme)}>
                  Buy for {formatUsd(theme.priceCents)}
                </Button>
              )}
              <Link href={`/demo?theme=${encodeURIComponent(theme.id)}`} target="_blank" className={buttonClass("secondary", "sm")}>
                Try it ↗
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {buying && <BuyThemeDialog key={buying.id} theme={buying} onClose={() => setBuying(null)} />}
    </>
  );
}
