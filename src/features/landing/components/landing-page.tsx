import Link from "next/link";
import { CtaLocation } from "@/lib/analytics/events";
import { trackClick } from "@/lib/analytics/track";
import { Heart, Sparkle } from "@/components/shared/doodles";
import { InkButton, Wordmark } from "@/components/shared/studio";
import { ClosingMotion } from "./closing-motion";
import { Faq } from "./faq";
import { Hero } from "./hero";
import { HowItGoes } from "./how-it-goes";
import { Pricing } from "./pricing";
import { Scrapbook } from "./scrapbook";
import { SiteNav } from "./site-nav";
import { Story } from "./story";
import { StudioShowcase } from "./studio-showcase";
import { ThemesBoard } from "./themes-board";
import type { ThemePrice } from "@/lib/format";

const CLOSING = "Go on. Ask them.";

/** `envelopePrice` is undefined while Envelope isn't on sale; the page then leaves it out. */
export function LandingPage({ envelopePrice }: { envelopePrice: ThemePrice | undefined }) {
  return (
    <div className="studio w-full overflow-x-clip">
      <SiteNav />
      <main>
        <Hero />
        <Scrapbook />
        <HowItGoes />
        <StudioShowcase envelopePrice={envelopePrice} />
        <ThemesBoard envelopePrice={envelopePrice} />
        <Pricing envelopePrice={envelopePrice} />
        <Story />
        <Faq />

        <section className="relative mx-auto mt-28 max-w-6xl px-5 text-center sm:px-8">
          <ClosingMotion>
            <Sparkle aria-hidden data-closing-sparkle="" className="mx-auto size-7 text-ink" />
            <h2 aria-label={CLOSING} className="mt-4 font-display text-[clamp(32px,4.6vw,52px)] leading-[1.1] text-ink">
              {/* Letter by letter, so they can bounce in; words stay unbroken */}
              {CLOSING.split(" ").map((word, w) => (
                <span key={w} aria-hidden="true" className="inline-block whitespace-nowrap">
                  {[...word].map((ch, i) => (
                    <span key={i} data-letter="" className="inline-block">
                      {ch}
                    </span>
                  ))}
                  {w < CLOSING.split(" ").length - 1 && " "}
                </span>
              ))}
            </h2>
            <p className="mt-3 text-[15px] text-muted">It takes about a minute, and Kitten Soft is free. Add a song if you like.</p>
            <div className="mt-7 flex justify-center">
              <span data-burst="">
                <InkButton href="/dashboard/invites/new" {...trackClick("make_invite_clicked", { location: CtaLocation.Closing })}>
                  Make an invite <Heart className="size-3.5 text-rose" strokeWidth={2.4} />
                </InkButton>
              </span>
            </div>
          </ClosingMotion>
        </section>
      </main>

      <footer className="mt-28 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-4 px-5 py-9 sm:px-8">
          <Wordmark className="h-[38px] w-auto" />
          <p className="font-mono text-[12px] leading-relaxed text-muted">
            © 2026
            <br />
            answers arrive on telegram
          </p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 text-[14px] text-muted sm:ml-auto">
            <Link href="/demo" className="py-2 hover:text-ink">Demo</Link>
            <Link href="/login" className="py-2 hover:text-ink">Log in</Link>
            <Link href="/dashboard" className="py-2 hover:text-ink">Dashboard</Link>
            <a href="#faq" className="py-2 hover:text-ink">FAQ</a>
            <Link href="/terms" className="py-2 hover:text-ink">Terms</Link>
            <Link href="/privacy" className="py-2 hover:text-ink">Privacy</Link>
            <Link href="/refunds" className="py-2 hover:text-ink">Refunds</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
