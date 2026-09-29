import { Arrow, Sparkle } from "@/components/shared/doodles";
import { CtaLocation } from "@/lib/analytics/events";
import { trackClick } from "@/lib/analytics/track";
import { InkButton } from "@/components/shared/studio";
import { StudioMock } from "./studio-mock";

export function StudioShowcase({ envelopePrice }: { envelopePrice: number | undefined }) {
  return (
    <section id="studio" aria-labelledby="studio-title" className="relative mx-auto mt-28 max-w-6xl scroll-mt-24 px-5 sm:mt-36 sm:px-8">
      <div className="text-center">
        <h2 id="studio-title" className="font-display text-[clamp(30px,4vw,44px)] leading-tight text-ink">
          Made in the studio
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
          Write your question, add the plan and try on a Theme. The phone shows exactly what they&apos;ll see, as you type.
        </p>
      </div>

      <div className="relative mx-auto mt-14 max-w-[860px]">
        <StudioMock envelopePrice={envelopePrice} />

        {/* Typewriter notes pointing into the studio, like the scrapbook's */}
        <div aria-hidden="true" className="pointer-events-none max-xl:hidden">
          <div className="absolute top-[18%] -left-[150px]">
            <p className="w-32 font-mono text-[12px] leading-snug text-ink">tap a word to make it stand out</p>
            <Arrow className="mt-1 ml-16 w-20 text-ink" />
          </div>
          <div className="absolute top-[52%] -left-[150px]">
            <p className="w-32 font-mono text-[12px] leading-snug text-ink">try a Theme on before you pick</p>
            <Arrow className="mt-1 ml-16 w-20 text-ink" />
          </div>
          <div className="absolute top-[34%] -right-[160px] text-right">
            <Arrow className="mr-20 mb-1 ml-auto w-20 -scale-x-100 rotate-[-10deg] text-ink" />
            <p className="ml-auto w-40 font-mono text-[12px] leading-snug text-ink">what they&apos;ll see, live</p>
          </div>
          <Sparkle className="absolute -top-6 -right-5 size-7 text-ink" />
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <InkButton href="/dashboard/invites/new" {...trackClick("make_invite_clicked", { location: CtaLocation.Studio })}>
          Make an invite
        </InkButton>
      </div>
    </section>
  );
}
