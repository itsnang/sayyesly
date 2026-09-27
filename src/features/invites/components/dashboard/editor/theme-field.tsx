"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonClass, cx } from "@/components/shared/ui";
import { formatUsd } from "@/lib/format";
import type { ThemeChoice } from "../../../server/theme-access";

type ThemeFieldProps = {
  themes: ThemeChoice[];
  value: string;
  /** The Theme the saved invite already has; always usable */
  savedThemeId: string;
  onChange: (id: string) => void;
  /** Buy a locked Theme without leaving the form; falls back to the Themes page */
  onUnlock?: ((theme: ThemeChoice) => void) | undefined;
  disabled?: boolean;
};

/** Whether this Creator may save an invite with the Theme (free, bought, or already on the invite). */
export function isThemeLocked(theme: ThemeChoice | undefined, savedThemeId: string): boolean {
  return !!theme && !theme.usable && theme.id !== savedThemeId;
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

/**
 * The themes, always in view: a strip of cards that put the Theme on the live
 * preview when tapped, paid ones included, so people can try before they buy.
 * Saving with a locked Theme is refused; the unlock prompt says so up front.
 */
export function ThemeField({ themes, value, savedThemeId, onChange, onUnlock, disabled }: ThemeFieldProps) {
  const selected = themes.find((t) => t.id === value);
  const selectedLocked = isThemeLocked(selected, savedThemeId);

  return (
    <div>
      <ul aria-label="Themes" className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
        {themes.map((theme) => {
          const locked = isThemeLocked(theme, savedThemeId);
          const on = value === theme.id;
          return (
            <li key={theme.id} className="w-[104px] shrink-0 snap-start">
              <button
                type="button"
                disabled={disabled}
                aria-pressed={on}
                aria-label={locked ? `${theme.name}, ${formatUsd(theme.priceCents)}. Try it on your invite` : theme.name}
                onClick={() => onChange(theme.id)}
                className="group block w-full rounded-[8px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={cx(
                    // One 2px border that darkens when selected; a ring would stack a second outline
                    // and get clipped by the scrolling strip.
                    "relative block aspect-[4/5] overflow-hidden rounded-[8px] border-2 bg-surface transition-colors",
                    on ? "border-ink" : "border-ink/10 group-hover:border-ink/35",
                  )}
                >
                  {theme.thumbnail && <Image src={theme.thumbnail} alt="" fill sizes="104px" className="object-cover object-[50%_30%]" />}
                  {locked && (
                    <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-[5px] bg-white/95 px-1.5 py-0.5 text-[11.5px] font-semibold text-ink">
                      <LockIcon /> {formatUsd(theme.priceCents)}
                    </span>
                  )}
                </span>
                <span className="mt-1.5 block truncate text-[13px] font-medium text-ink">{theme.name}</span>
                <span className="block text-[12px] text-muted">{theme.priceCents === 0 ? "Free" : theme.usable ? "Yours" : "Try it free"}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected && selectedLocked && !disabled && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-[8px] bg-surface px-3 py-2.5">
          <p className="min-w-0 text-[13px] leading-snug text-ink">
            <b className="font-semibold">{selected.name}</b> is on your preview. Unlock it to send it.
          </p>
          {onUnlock ? (
            <button type="button" onClick={() => onUnlock(selected)} className={buttonClass("primary", "sm", "shrink-0")}>
              Unlock {formatUsd(selected.priceCents)}
            </button>
          ) : (
            <Link href="/dashboard/themes" className={buttonClass("primary", "sm", "shrink-0")}>
              Unlock
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
