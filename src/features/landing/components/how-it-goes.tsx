"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Arrow, Heart, Sparkle, Squiggle } from "@/components/shared/doodles";
import { ArrowIcon } from "@/components/shared/studio";

// Shown with the Envelope Theme, a real invite start to finish.
const STEPS = [
  {
    title: "It arrives sealed",
    body: "They tap your link, often straight from Telegram, and an envelope is waiting for them to open.",
    src: "/landing/envelope-sealed.png",
    position: "50% 45%",
    note: "one tap to open",
  },
  {
    title: "A letter opens",
    body: "Your question, your picture and a few words from you, handwritten, with the plan underneath.",
    src: "/landing/envelope-letter.png",
    position: "50% 0%",
    note: "your words, your picture",
  },
  {
    title: "They pick a time",
    body: "A day on the calendar and a time that suits them, or one of the times you offered.",
    src: "/landing/envelope-time.png",
    position: "50% 30%",
    note: "in your city's time",
  },
  {
    title: "You hear it first",
    body: "They see “see ya there!”, and a Telegram message tells you the day, the time and their note.",
    src: "/landing/envelope-yes.png",
    position: "50% 35%",
    note: "the same second",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

export function HowItGoes() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % STEPS.length), 4500);
    return () => clearInterval(id);
  }, [playing]);

  const step = STEPS[index]!;
  const go = (delta: number) => {
    setPlaying(false);
    setIndex((i) => (i + delta + STEPS.length) % STEPS.length);
  };

  return (
    <section id="how" aria-labelledby="how-title" className="mx-auto mt-24 max-w-6xl scroll-mt-24 px-5 sm:mt-32 sm:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
        <div>
          <h2 id="how-title" className="text-[15px] font-semibold tracking-[0.02em] text-ink uppercase">
            How it goes
          </h2>
          <p className="mt-2 text-[15px] leading-snug text-ink">What they see, from your link to their answer.</p>

          <p className="mt-10 font-serif text-[40px] leading-none text-ink" aria-live="polite">
            {pad(index + 1)}
            <span className="text-[20px] text-muted">/{pad(STEPS.length)}</span>
          </p>
          <h3 className="mt-3 text-[20px] font-semibold tracking-[0.01em] text-ink uppercase">{step.title}</h3>
          <p className="mt-2 min-h-[72px] text-[15px] leading-snug text-ink">{step.body}</p>

          <div className="mt-5 flex items-center gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Previous step" className="grid size-8 place-items-center rounded-[5px] bg-ink text-canvas">
              <ArrowIcon direction="left" className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
              className="grid size-8 place-items-center rounded-[5px] border-[1.5px] border-ink text-ink"
            >
              {playing ? (
                <svg viewBox="0 0 12 12" className="size-3" fill="currentColor" aria-hidden="true">
                  <rect x="2" y="1.5" width="2.6" height="9" rx="1" />
                  <rect x="7.4" y="1.5" width="2.6" height="9" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 12 12" className="size-3" fill="currentColor" aria-hidden="true">
                  <path d="M3 1.8v8.4c0 .5.5.8.9.5l6.3-4.2c.4-.2.4-.8 0-1L3.9 1.3C3.5 1 3 1.3 3 1.8z" />
                </svg>
              )}
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next step" className="grid size-8 place-items-center rounded-[5px] bg-ink text-canvas">
              <ArrowIcon className="size-3" />
            </button>
          </div>
        </div>

        {/* A thick-framed stage, like a game screen, with the real invite on it */}
        <div className="diary-paper relative overflow-hidden rounded-[22px] border-[3px] border-ink">
          <div className="relative mx-auto flex h-[440px] max-w-[520px] items-end justify-center pt-8 sm:h-[480px]">
            {STEPS.map((s, i) => (
              <span
                key={s.src}
                className={`absolute bottom-[-30px] w-[250px] rounded-t-[34px] border-[1.5px] border-b-0 border-ink bg-card p-[7px] pb-0 transition-all duration-500 sm:w-[270px] ${
                  i === index ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <span className="relative block aspect-[390/780] overflow-hidden rounded-t-[27px]">
                  <Image src={s.src} alt="" fill sizes="270px" className="object-cover" style={{ objectPosition: s.position }} />
                </span>
              </span>
            ))}
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 max-sm:hidden">
            <p className="absolute top-8 left-6 w-28 font-mono text-[12px] leading-snug text-ink transition-opacity">{step.note}</p>
            <Arrow className="absolute top-20 left-16 w-24 text-ink" />
            <Sparkle className="absolute top-10 right-10 size-7 text-ink" />
            <Heart className="absolute right-16 bottom-20 size-7 text-rose" />
            <Squiggle className="absolute bottom-10 left-8 w-16 text-ink" />
          </div>
        </div>
      </div>
    </section>
  );
}
