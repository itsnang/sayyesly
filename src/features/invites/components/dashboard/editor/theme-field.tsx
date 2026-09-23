"use client";

import Image from "next/image";
import Link from "next/link";
import { formatUsd } from "@/lib/format";
import type { ThemeChoice } from "../../../server/theme-access";

type ThemeFieldProps = {
  themes: ThemeChoice[];
  value: string;
  /** The Theme the saved invite already has; always selectable */
  savedThemeId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
};

export function ThemeField({ themes, value, savedThemeId, onChange, disabled }: ThemeFieldProps) {
  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {themes.map((theme) => {
        const selectable = !disabled && (theme.usable || theme.id === savedThemeId);
        const selected = value === theme.id;
        return (
          <div key={theme.id} className="relative">
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!selectable}
              onClick={() => onChange(theme.id)}
              className={`group block w-full rounded-[18px] border-[1.5px] p-2 text-left transition ${
                selected ? "border-ink bg-card shadow-[4px_5px_0_var(--color-rose-soft)]" : "border-ink/12 bg-card hover:border-ink/40"
              } disabled:cursor-not-allowed`}
            >
              <span className={`relative block aspect-[4/5] overflow-hidden rounded-[12px] bg-surface ${!selectable ? "opacity-55" : ""}`}>
                {theme.thumbnail && <Image src={theme.thumbnail} alt="" fill sizes="200px" className="object-cover object-[50%_32%]" />}
                {selected && (
                  <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-ink text-[12px] text-canvas">✓</span>
                )}
              </span>
              <span className="mt-2 flex items-baseline justify-between gap-2 px-1">
                <span className="text-[14px] font-medium text-ink">{theme.name}</span>
                <span className="font-mono text-[12px] text-muted">
                  {theme.priceCents === 0 ? "free" : theme.usable ? "yours" : formatUsd(theme.priceCents)}
                </span>
              </span>
            </button>
            {!theme.usable && theme.id !== savedThemeId && (
              <div className="mt-1.5 flex gap-3 px-1 text-[12.5px]">
                <Link href="/dashboard/themes" className="text-rose-deep underline underline-offset-4">
                  Unlock
                </Link>
                <Link href={`/demo?theme=${theme.id}`} target="_blank" className="text-muted underline underline-offset-4 hover:text-ink">
                  Try it
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
