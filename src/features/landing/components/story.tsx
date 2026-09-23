import { Cat, Cloud, Flower, Heart, Leaf, Sparkle } from "@/components/shared/doodles";

export function Story() {
  return (
    <section aria-labelledby="story-title" className="relative mx-auto mt-32 max-w-6xl overflow-hidden px-5 py-10 sm:mt-40 sm:px-8">
      <div className="relative z-10 mx-auto max-w-[460px] text-center">
        <h2 id="story-title" className="font-display text-[clamp(26px,3.4vw,36px)] leading-[1.2] text-ink">
          It started as one page,
          <br />
          for one dinner.
        </h2>
        <p className="mt-6 text-[15.5px] leading-[1.7] text-muted">
          A kitten, a calendar, a steakhouse in Phnom Penh, and a “no” button that wouldn&apos;t sit still. It was
          made to ask one person out, and to make asking feel light instead of scary. Now anyone can make their own.
        </p>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 max-md:opacity-40">
        <Cat className="absolute bottom-6 left-[4%] w-32 text-ink lg:w-40" />
        <Heart className="absolute top-10 left-[16%] size-6 text-rose" />
        <Cloud fill="var(--color-sky)" className="absolute top-4 left-[3%] w-14 text-ink" />
        <Flower fill="var(--color-rose-soft)" className="absolute top-8 right-[8%] w-12 text-ink" />
        <Leaf fill="var(--color-sage)" className="absolute right-[18%] bottom-16 w-10 text-ink" />
        <Sparkle className="absolute right-[5%] bottom-8 size-8 text-ink" />
      </div>
    </section>
  );
}
