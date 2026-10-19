import Image from "next/image";
import { buttonClass, cx, SalePrice } from "@/components/shared/ui";
import type { ThemePrice } from "@/lib/format";
import type { ReactNode } from "react";
import { PhoneFrame } from "./phone-frame";

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="m6 3.5 4.5 4.5L6 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThemeCard({ id, src, name, price, selected }: { id: string; src: string; name: string; price: ReactNode; selected?: boolean }) {
  return (
    <div className="w-[76px]">
      <div className="relative aspect-[3/4] rounded-[6px] border border-hairline bg-surface">
        <span className="absolute inset-0 overflow-hidden rounded-[6px]">
          <Image src={src} alt="" fill sizes="76px" className="object-cover object-[50%_30%]" />
        </span>
        {/* The selection ring, its own element so the demo reel can move it between cards */}
        <span data-ring={id} className={cx("pointer-events-none absolute -inset-[4px] rounded-[9px] border-2 border-ink", !selected && "opacity-0")} />
      </div>
      <p className="mt-2 text-[12px] leading-tight text-ink">{name}</p>
      <p className="text-[11px] text-muted">{price}</p>
    </div>
  );
}

/** Bar heights of the song's little waveform, like the studio's Song part picker. */
const WAVE = [0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.7, 0.45, 0.8, 0.55, 0.95, 0.6, 0.75, 0.5, 0.85, 0.4, 0.65, 0.9, 0.5, 0.7];

/**
 * The invite studio as a Creator sees it, drawn with the studio's own parts
 * (inputs, Theme cards, rows, the Song's part picker, the iPhone preview on
 * the grey stage). Its `data-studio` parts are what StudioMotion's demo reel animates.
 */
export function StudioMock({ envelopePrice, className }: { envelopePrice: ThemePrice | undefined; className?: string }) {
  const words = ["will", "you", "have", "dinner", "with", "me?"];
  // Envelope leads while it's on sale; otherwise the free Theme stands in.
  const showEnvelope = envelopePrice !== undefined;
  return (
    <div
      role="img"
      aria-label="The sayyesly studio: your question with one word highlighted, the Theme picker, a song with the part that plays, and the invite previewed on a phone"
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
              <span data-studio="typed" className="inline-block">
                will you have dinner with me?
              </span>
            </div>
            <p className="mt-2.5 text-[11px] text-muted">Tap a word to highlight it</p>
            <div className="mt-1.5 flex flex-wrap gap-0.5 text-[12.5px] text-ink">
              {words.map((w) => (
                <span
                  key={w}
                  data-studio={w === "dinner" ? "highlight" : undefined}
                  className={cx(
                    "inline-block rounded-[5px] px-1 py-0.5",
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
              <ThemeCard id="kitten" src="/landing/step-ask.png" name="Kitten Soft" price="Free" selected={!showEnvelope} />
              {showEnvelope && <ThemeCard id="envelope" src="/landing/envelope-card.png" name="Envelope" price={<SalePrice price={envelopePrice} />} selected />}
            </div>
          </div>

          {/* The Song: a waveform, the chosen part as a window over it, and the playhead running through it */}
          <div data-studio="song" className="border-t border-hairline p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[12.5px] font-medium text-ink">Song</p>
              <p className="text-[11px] text-muted">♪ plays 0:42 – 1:12</p>
            </div>
            <div className="relative mt-2.5 h-9 rounded-[6px] bg-ink/[0.06]">
              <div className="absolute inset-x-2 top-1/2 flex h-5 -translate-y-1/2 items-center justify-between">
                {WAVE.map((h, i) => (
                  <span key={i} className="w-[3px] rounded-full bg-ink/25" style={{ height: `${h * 100}%` }} />
                ))}
              </div>
              <div data-studio="part" className="absolute inset-y-0 left-[38%] w-[30%] rounded-[6px] border-2 border-ink bg-ink/10">
                <span data-studio="playhead" className="absolute inset-y-0 left-0 w-[2px] bg-rose" />
              </div>
            </div>
          </div>

          {[
            ["Plan", showEnvelope ? "Papa Wong's" : "dinner, then a walk"],
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
          <PhoneFrame
            src={showEnvelope ? "/landing/envelope-letter.png" : "/landing/step-ask.png"}
            {...(showEnvelope ? { beforeSrc: "/landing/step-ask.png" } : {})}
            alt=""
            sizes="220px"
            className="mt-5 -mb-16 w-[210px] sm:w-[220px]"
          />
        </div>
      </div>
    </div>
  );
}
