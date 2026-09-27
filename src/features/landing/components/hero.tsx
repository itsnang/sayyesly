import { Cloud, Envelope, Flower, Heart, Leaf, Loop, Petal, Sparkle, Spiral, Squiggle, Star } from "@/components/shared/doodles";
import Link from "next/link";
import { InkButton } from "@/components/shared/studio";
import { buttonClass } from "@/components/shared/ui";

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

      {/* wide screens: the rest of the arc (on tablets the headline runs into it) */}
      <div className="max-lg:hidden">
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
            <span className="mt-1 block text-muted max-sm:mt-3 max-sm:text-[22px] max-sm:leading-snug">
              One link with your question and the plan. Their answer lands in your Telegram.
            </span>
          </h1>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <InkButton href="/dashboard/invites/new">Make an invite</InkButton>
            <Link href="/demo?theme=envelope" className={buttonClass("secondary", "md", "px-5")}>
              Try the demo
            </Link>
          </div>
          {/* What a visitor needs to know before clicking: it's free, you need Telegram, they don't need anything. */}
          <p className="mt-4 text-[13px] leading-snug text-balance text-muted">
            <span className="whitespace-nowrap">Free to start ·</span> <span className="whitespace-nowrap">you log in with Telegram ·</span>{" "}
            <span className="whitespace-nowrap">they don&apos;t need an account</span>
          </p>
        </div>
      </div>

      {/* Baseline with a few flowers and a sealed invite, like a doodle along the bottom of a notebook */}
      <div className="relative mt-10 flex items-end justify-between px-[8%]" aria-hidden="true">
        <div className="flex items-end gap-1.5">
          <Flower fill="var(--color-sun)" className="w-9 text-ink sm:w-10" />
          <Leaf fill="var(--color-sage)" className="mb-1 w-6 -rotate-12 text-ink sm:w-7" />
          <Flower fill="var(--color-sky)" className="w-7 text-ink sm:w-8" />
        </div>
        <div className="mb-1 flex items-end gap-2">
          <Heart className="mb-5 size-4 -rotate-12 text-rose" />
          <Envelope className="w-14 rotate-[-8deg] text-ink sm:w-16" />
        </div>
        <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-ink" />
      </div>
    </section>
  );
}
