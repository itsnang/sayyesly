import Image from "next/image";
import { buttonClass, cx } from "@/components/shared/ui";
import { formatUsd } from "@/lib/format";
import { PhoneFrame } from "./phone-frame";

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="m6 3.5 4.5 4.5L6 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThemeCard({ src, name, price, selected }: { src: string; name: string; price: string; selected?: boolean }) {
  return (
    <div className="w-[76px]">
      <div
        className={cx(
          "relative aspect-[3/4] overflow-hidden rounded-[6px] border border-hairline bg-surface",
          selected && "ring-2 ring-ink ring-offset-2 ring-offset-card",
        )}
      >
        <Image src={src} alt="" fill sizes="76px" className="object-cover object-[50%_30%]" />
      </div>
      <p className="mt-2 text-[12px] leading-tight text-ink">{name}</p>
      <p className="text-[11px] text-muted">{price}</p>
    </div>
  );
}

/**
 * The invite studio as a Creator sees it, drawn with the studio's own parts
 * (inputs, Theme cards, rows, the iPhone preview on the grey stage).
 */
export function StudioMock({ loveLetterPrice, className }: { loveLetterPrice: number | undefined; className?: string }) {
  const words = ["will", "you", "have", "dinner", "with", "me?"];
  return (
    <div
      role="img"
      aria-label="The sayyesly studio: your question with one word highlighted, the Theme picker, and the invite previewed on a phone"
      className={cx(
        "overflow-hidden rounded-[14px] border border-hairline bg-card shadow-[0_40px_80px_-40px_rgba(60,30,20,0.35)]",
        className,
      )}
    >
      <div className="flex h-11 items-center justify-between border-b border-hairline px-4" aria-hidden="true">
        <p className="text-[12.5px] text-muted">
          Invites <span className="px-1 text-faint">/</span> <span className="text-ink">New invite</span>
        </p>
        <span className={buttonClass("primary", "sm", "pointer-events-none px-3 py-1 text-[12px]")}>Create invite</span>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]" aria-hidden="true">
        <div className="hidden border-r border-hairline md:block">
          <div className="p-4">
            <p className="text-[12.5px] font-medium text-ink">Question</p>
            <div className="mt-2 rounded-[7px] border border-ink/20 bg-white px-3 py-2 text-[13px] text-ink">
              will you have dinner with me?
            </div>
            <p className="mt-2.5 text-[11px] text-muted">Tap a word to highlight it</p>
            <div className="mt-1.5 flex flex-wrap gap-0.5 text-[12.5px] text-ink">
              {words.map((w) => (
                <span
                  key={w}
                  className={cx(
                    "rounded-[5px] px-1 py-0.5",
                    w === "dinner" && "bg-rose-soft text-rose-deep underline decoration-rose decoration-2 underline-offset-4",
                  )}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-hairline p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[12.5px] font-medium text-ink">Theme</p>
              <p className="text-[11px] text-muted">Tap to try one on</p>
            </div>
            <div className="mt-3 flex gap-3">
              <ThemeCard src="/landing/step-ask.png" name="Kitten Soft" price="Free" selected />
              {loveLetterPrice !== undefined && (
                <ThemeCard src="/landing/theme-love-letter.png" name="Love Letter" price={formatUsd(loveLetterPrice)} />
              )}
            </div>
          </div>

          {[
            ["Plan", "mauu steak · steakhouse"],
            ["When", "They pick"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-3 text-[12.5px]">
              <span className="font-medium text-ink">{label}</span>
              <span className="flex items-center gap-1.5 truncate text-muted">
                {value} <Chevron />
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center bg-stage px-6 pt-5">
          <div className="flex rounded-[8px] border border-hairline bg-card p-0.5 text-[11.5px]">
            <span className="rounded-[6px] bg-ink px-2.5 py-1 text-canvas">Phone</span>
            <span className="px-2.5 py-1 text-muted">Desktop</span>
          </div>
          <PhoneFrame src="/landing/step-ask.png" alt="" sizes="220px" className="mt-5 -mb-16 w-[210px] sm:w-[220px]" />
        </div>
      </div>
    </div>
  );
}
