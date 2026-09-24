import Image from "next/image";
import Link from "next/link";
import { Heart, Sparkle, Star } from "@/components/shared/doodles";
import { Tape } from "@/components/shared/studio";

function Polaroid({
  src,
  alt,
  caption,
  price,
  href,
  className,
}: {
  src: string;
  alt: string;
  caption: string;
  price: string;
  href: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative block w-[250px] bg-card p-3 pb-4 shadow-[0_16px_30px_-16px_rgba(60,30,20,0.45)] transition-transform hover:rotate-0 ${className}`}
    >
      <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
      <span className="relative block aspect-square overflow-hidden bg-surface">
        <Image src={src} alt={alt} fill sizes="250px" className="object-cover object-[50%_32%]" />
      </span>
      <span className="mt-3 flex items-baseline justify-between font-mono text-[13px] text-ink">
        {caption}
        <span className="text-muted">{price}</span>
      </span>
      <span className="mt-1 block font-mono text-[11.5px] text-muted group-hover:text-ink">try it →</span>
    </Link>
  );
}

export function ThemesBoard() {
  return (
    <section id="themes" aria-labelledby="themes-title" className="mx-auto mt-28 max-w-6xl scroll-mt-24 px-5 sm:mt-36 sm:px-8">
      <div className="text-center">
        <h2 id="themes-title" className="font-display text-[clamp(30px,4vw,44px)] leading-tight text-ink">
          Pick a mood
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
          A theme is the look and the personality. The question, the plan and the answer work the same in all of them.
        </p>
      </div>

      <div className="relative mt-14 flex flex-wrap items-start justify-center gap-x-12 gap-y-14">
        <Polaroid
          src="/landing/step-ask.png"
          alt="the Kitten Soft theme"
          caption="kitten soft"
          price="free"
          href="/demo"
          className="-rotate-3"
        />
        <Polaroid
          src="/landing/theme-night.png"
          alt="the Kitten Night theme"
          caption="kitten night"
          price="$1.99"
          href="/demo?theme=kitten-night"
          className="mt-8 rotate-2"
        />

        {/* sticky note */}
        <div className="relative w-[230px] rotate-[1.5deg] bg-[#fbe99a] p-5 pt-6 shadow-[0_14px_26px_-16px_rgba(60,30,20,0.45)] sm:mt-4">
          <p className="font-mono text-[12px] tracking-[0.06em] text-ink uppercase">every theme comes with</p>
          <ul className="mt-3 space-y-2 text-[14px] leading-snug text-ink">
            {["your plan & up to 3 photos", "a calendar in your time zone", 'the runaway "no" button', "the Telegram ping"].map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-rose">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-[11.5px] leading-snug text-ink/70">paid themes: pay once with any KHQR banking app</p>
        </div>

        <Star aria-hidden className="absolute top-0 left-[12%] size-6 fill-sun text-ink max-md:hidden" />
        <Sparkle aria-hidden className="absolute right-[10%] bottom-4 size-7 text-ink max-md:hidden" />
        <Heart aria-hidden className="absolute bottom-0 left-[20%] size-5 text-rose max-md:hidden" />
      </div>
    </section>
  );
}
