import { Cat, Cloud, Envelope, Flower, Heart, Leaf, Loop, Petal, Sparkle, Spiral, Squiggle, Star } from "@/components/shared/doodles";
import { InkButton } from "@/components/shared/studio";

/**
 * Doodles in a loose arc around the headline (positions are % of the hero box).
 * On phones only a few stay, in a band above the text, so nothing covers it.
 */
function DoodleArc() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* kept on phones: the top band */}
      <Heart className="absolute top-[3%] left-[8%] size-6 text-ink sm:top-[14%] sm:left-[9%] sm:size-7" />
      <Leaf fill="var(--color-sage)" className="absolute top-[1%] left-[34%] w-9 text-ink sm:top-[3%] sm:left-[38%] sm:w-10" />
      <Loop className="absolute top-[3%] right-[22%] w-16 -scale-x-100 text-ink sm:top-[5%] sm:right-[20%] sm:w-20" />
      <Cloud fill="var(--color-sky)" className="absolute top-[4%] right-[4%] w-12 -scale-x-100 text-ink sm:top-[42%] sm:right-[3%] sm:w-16" />

      {/* wider screens: the rest of the arc */}
      <div className="max-sm:hidden">
        <Loop className="absolute top-[4%] left-[18%] w-16 text-ink" />
        <Cloud fill="var(--color-sky)" className="absolute top-[26%] left-[3%] w-14 text-ink" />
        <Spiral className="absolute top-[38%] left-[14%] size-9 text-ink" />
        <Sparkle className="absolute top-[52%] left-[6%] size-7 text-ink" />
        <Petal fill="var(--color-coral)" className="absolute top-[62%] left-[16%] w-9 text-ink" />
        <Squiggle className="absolute top-[74%] left-[2%] w-14 text-ink" />
        <Star className="absolute top-[1%] left-[56%] size-6 text-ink" />
        <Flower fill="var(--color-rose-soft)" className="absolute top-[18%] right-[6%] w-12 text-ink" />
        <Sparkle className="absolute top-[30%] right-[18%] size-6 text-ink" />
        <Heart className="absolute top-[58%] right-[14%] size-6 text-rose" />
        <Leaf fill="var(--color-sage)" className="absolute top-[66%] right-[4%] w-9 rotate-45 text-ink" />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 sm:px-8">
      <div className="relative pt-24 pb-6 sm:pt-20">
        <DoodleArc />
        <div className="relative mx-auto max-w-[560px] text-center">
          <h1 className="font-display text-[clamp(30px,4.1vw,46px)] leading-[1.14] tracking-[-0.01em] text-balance text-ink">
            <span className="block">Send an invite they&apos;ll say yes to.</span>
            <span className="mt-1 block text-muted">
              One link with your question and the plan. Their answer lands in your Telegram.
            </span>
          </h1>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <InkButton href="/dashboard/invites/new">Make your invite</InkButton>
            <p className="text-left text-[13px] leading-tight">
              <span className="block text-ink">Free to start</span>
              <span className="text-muted">they don&apos;t need an account</span>
            </p>
          </div>
        </div>
      </div>

      {/* Baseline with the cat and a sealed invite, like a doodle along the bottom of a notebook */}
      <div className="relative mt-10 flex items-end justify-between px-[8%]" aria-hidden="true">
        <Cat className="w-24 text-ink sm:w-28" />
        <div className="mb-1 flex items-end gap-2">
          <Heart className="mb-5 size-4 -rotate-12 text-rose" />
          <Envelope className="w-14 rotate-[-8deg] text-ink sm:w-16" />
        </div>
        <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-ink" />
      </div>
    </section>
  );
}
