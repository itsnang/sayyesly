"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonClass, cx, Stamp } from "@/components/shared/ui";
import { formatUsd } from "@/lib/format";
import type { ThemeChoice } from "../../../server/theme-access";

type ThemeFieldProps = {
  themes: ThemeChoice[];
  value: string;
  /** The Theme the saved invite already has; always selectable */
  savedThemeId: string;
  onChange: (id: string) => void;
  /** Buy a locked Theme without leaving the form; falls back to the Themes page */
  onUnlock?: ((theme: ThemeChoice) => void) | undefined;
  disabled?: boolean;
};

export function ThemeField({ themes, value, savedThemeId, onChange, onUnlock, disabled }: ThemeFieldProps) {
  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {themes.map((theme) => {
        const locked = !theme.usable && theme.id !== savedThemeId;
        const selectable = !disabled && !locked;
        const selected = value === theme.id;
        return (
          <div key={theme.id} className="flex flex-col">
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!selectable}
              onClick={() => onChange(theme.id)}
              className={cx(
                "group block w-full rounded-[8px] border-[1.5px] p-1.5 text-left transition disabled:cursor-not-allowed",
                selected ? "border-ink bg-card shadow-[4px_4px_0_var(--color-rose)]" : "border-ink/25 bg-card enabled:hover:border-ink",
              )}
            >
              <span className="relative block aspect-[4/5] overflow-hidden rounded-[4px] bg-surface">
                {theme.thumbnail && (
                  <Image src={theme.thumbnail} alt="" fill sizes="200px" className={cx("object-cover object-[50%_32%]", locked && "opacity-60 grayscale-[35%]")} />
                )}
                {selected && (
                  <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-[4px] border-[1.5px] border-ink bg-ink text-[12px] text-canvas">✓</span>
                )}
                {locked && (
                  <Stamp tone="ink" className="absolute top-2 left-2 bg-card">
                    {formatUsd(theme.priceCents)}
                  </Stamp>
                )}
              </span>
              <span className="mt-2 flex items-baseline justify-between gap-2 px-1 pb-0.5">
                <span className="text-[14px] font-medium text-ink">{theme.name}</span>
                <span className="font-mono text-[11.5px] text-muted">{theme.priceCents === 0 ? "free" : theme.usable ? "yours" : "locked"}</span>
              </span>
            </button>
            {locked && !disabled && (
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-1.5">
                {onUnlock ? (
                  <button type="button" onClick={() => onUnlock(theme)} className={buttonClass("primary", "sm")}>
                    Unlock {formatUsd(theme.priceCents)}
                  </button>
                ) : (
                  <Link href="/dashboard/themes" className={buttonClass("primary", "sm")}>
                    Unlock
                  </Link>
                )}
                <Link href={`/demo?theme=${theme.id}`} target="_blank" className={buttonClass("secondary", "sm")} aria-label={`Try ${theme.name}`}>
                  Try ↗
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
