import Link from "next/link";
import type { ReactNode } from "react";
import { Heart, Smiley, Sparkle } from "@/components/shared/doodles";
import { formatUsd } from "@/lib/format";

/** Zig-zag paper edge along the bottom of a receipt. */
function ZigZag() {
  const teeth = 28;
  const d = Array.from({ length: teeth }, (_, i) => `L${((i + 0.5) / teeth) * 100},8 L${((i + 1) / teeth) * 100},0`).join(" ");
  return (
    <svg viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" className="absolute top-full left-0 h-2.5 w-full text-card">
      <path d={`M0,0 ${d} Z`} fill="currentColor" />
    </svg>
  );
}

function Line({ item, price, strong }: { item: string; price: string; strong?: boolean }) {
  return (
    <li className={`flex items-baseline gap-2 ${strong ? "text-[15px] font-bold" : ""}`}>
      <span>{item}</span>
      <span aria-hidden="true" className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-ink/40" />
      <span>{price}</span>
    </li>
  );
}

function Receipt({ title, number, children, className }: { title: string; number: string; children: ReactNode; className?: string }) {
  return (
    <div className={`relative w-full max-w-[340px] bg-card px-6 pt-6 pb-8 font-mono text-[13.5px] text-ink shadow-[0_18px_30px_-18px_rgba(60,30,20,0.45)] ${className ?? ""}`}>
      <p className="text-center tracking-[0.18em] uppercase">{title}</p>
      <p className="mt-1 text-center text-[11.5px] text-muted">
        no. {number}
      </p>
      <p aria-hidden="true" className="my-4 overflow-hidden text-ink/40 whitespace-nowrap">- - - - - - - - - - - - - - - - - - - - - - - -</p>
      {children}
      <ZigZag />
    </div>
  );
}

export function Pricing({ envelopePrice }: { envelopePrice: number | undefined }) {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="relative mx-auto mt-28 max-w-6xl scroll-mt-24 px-5 sm:mt-36 sm:px-8">
      <div className="text-center">
        <h2 id="pricing-title" className="font-display text-[clamp(30px,4vw,44px)] leading-tight text-ink">
          What it costs
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
          Asking is free. If you want a different look, a Theme is a one-time buy, no subscription.
        </p>
      </div>

      <div className="relative mt-14 flex flex-col items-center gap-14 md:flex-row md:items-start md:justify-center md:gap-12">
        <Receipt title="Everything you need" number="0001" className="-rotate-[1.5deg]">
          <ul className="space-y-2">
            <Line item="invites" price="unlimited" />
            <Line item="plan, photos, calendar" price="free" />
            <Line item="answers on telegram" price="free" />
            <Line item="group chat pings" price="free" />
            <Line item="kitten soft theme" price="free" />
          </ul>
          <p aria-hidden="true" className="my-4 overflow-hidden text-ink/40 whitespace-nowrap">- - - - - - - - - - - - - - - - - - - - - - - -</p>
          <ul>
            <Line item="TOTAL" price="$0.00" strong />
          </ul>
          <p className="mt-4 text-center text-[12px] text-muted">no card. they don&apos;t need an account.</p>
          <Link
            href="/dashboard/invites/new"
            className="mt-5 block rounded-[4px] border-[1.5px] border-ink py-2 text-center text-[12.5px] tracking-[0.08em] uppercase transition hover:bg-ink hover:text-canvas"
          >
            Make an invite
          </Link>
        </Receipt>

        {envelopePrice !== undefined && (
        <Receipt title="Paid themes" number="0002" className="rotate-[1.2deg] md:mt-10">
          <ul className="space-y-2">
            <Line item="envelope theme" price={formatUsd(envelopePrice)} />
            <Line item="sealed envelope" price="incl." />
            <Line item="handwritten letter" price="incl." />
            <Line item="everything on no. 0001" price="free" />
          </ul>
          <p aria-hidden="true" className="my-4 overflow-hidden text-ink/40 whitespace-nowrap">- - - - - - - - - - - - - - - - - - - - - - - -</p>
          <ul>
            <Line item="TOTAL, ONCE" price={formatUsd(envelopePrice)} strong />
          </ul>
          <p className="mt-4 text-center text-[12px] text-muted">yours for every invite after that.</p>
          <p aria-hidden="true" className="my-4 overflow-hidden text-ink/40 whitespace-nowrap">- - - - - - - - - - - - - - - - - - - - - - - -</p>
          <p className="text-[12px] leading-relaxed">
            PAID WITH: KHQR
            <br />
            <span className="text-muted">scan with any KHQR banking app. the theme unlocks the moment it&apos;s paid.</span>
          </p>
          <Link
            href="/demo?theme=envelope"
            className="mt-5 block rounded-[4px] border-[1.5px] border-ink py-2 text-center text-[12.5px] tracking-[0.08em] uppercase transition hover:bg-ink hover:text-canvas"
          >
            Try the demo
          </Link>
        </Receipt>
        )}

        <Smiley aria-hidden className="absolute top-2 left-[14%] size-10 -rotate-12 max-lg:hidden" />
        <Sparkle aria-hidden className="absolute right-[14%] bottom-10 size-7 text-ink max-lg:hidden" />
        <Heart aria-hidden className="absolute top-24 right-[18%] size-6 text-rose max-lg:hidden" />
      </div>
    </section>
  );
}
