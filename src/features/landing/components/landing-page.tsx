import Link from "next/link";
import { Heart, Sparkle } from "@/components/shared/doodles";
import { InkButton, Wordmark } from "@/components/shared/studio";
import { Faq } from "./faq";
import { Hero } from "./hero";
import { HowItGoes } from "./how-it-goes";
import { Pricing } from "./pricing";
import { Scrapbook } from "./scrapbook";
import { SiteNav } from "./site-nav";
import { Story } from "./story";
import { ThemesBoard } from "./themes-board";

/** `loveLetterPrice` is undefined while Love Letter isn't on sale; the page then leaves it out. */
export function LandingPage({ loveLetterPrice }: { loveLetterPrice: number | undefined }) {
  return (
    <div className="studio w-full overflow-x-clip">
      <SiteNav />
      <main>
        <Hero />
        <Scrapbook />
        <HowItGoes />
        <ThemesBoard loveLetterPrice={loveLetterPrice} />
        <Pricing loveLetterPrice={loveLetterPrice} />
        <Story />
        <Faq />

        <section className="relative mx-auto mt-28 max-w-6xl px-5 text-center sm:px-8">
          <Sparkle aria-hidden className="mx-auto size-7 text-ink" />
          <h2 className="mt-4 font-display text-[clamp(32px,4.6vw,52px)] leading-[1.1] text-ink">
            Go on. Ask them.
          </h2>
          <p className="mt-3 text-[15px] text-muted">It takes about a minute, and Kitten Soft is free.</p>
          <div className="mt-7 flex justify-center">
            <InkButton href="/dashboard/invites/new">
              Make your invite <Heart className="size-3.5 text-rose" strokeWidth={2.4} />
            </InkButton>
          </div>
        </section>
      </main>

      <footer className="mt-28 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-4 px-5 py-9 sm:px-8">
          <Wordmark className="h-[38px] w-auto" />
          <p className="font-mono text-[12px] leading-relaxed text-muted">
            made with love · 2026
            <br />
            answers arrive on telegram
          </p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-muted sm:ml-auto">
            <Link href="/demo" className="hover:text-ink">Demo</Link>
            <Link href="/login" className="hover:text-ink">Log in</Link>
            <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
