"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Arrow, Heart, Sparkle, Squiggle } from "@/components/shared/doodles";
import { ArrowIcon } from "@/components/shared/studio";
import { undrawn, whenSeen } from "./motion-kit";

gsap.registerPlugin(useGSAP);

// Shown with the Envelope Theme, a real invite start to finish.
const STEPS = [
  {
    title: "It arrives sealed",
    body: "They tap your link, often straight from Telegram, and an envelope is waiting for them to open. One tap, and your song starts.",
    src: "/landing/envelope-sealed.png",
    position: "50% 45%",
    note: "one tap to open",
  },
  {
    title: "A letter opens",
    body: "Your question, your picture and a few words from you, handwritten, with the plan underneath, while your song plays.",
    src: "/landing/envelope-letter.png",
    position: "50% 0%",
    note: "your words, your song",
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

const ADVANCE_MS = 4500;
const SWIPE_PX = 40;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * What the Recipient sees, one step at a time. It starts playing once it's in
 * view; each step change is a little show (the phone springs up, the number
 * rolls, the title types itself, the note redraws). Arrows, pause, and a swipe
 * on phones move it by hand. With "reduce motion" on it's a plain crossfade.
 */
export function HowItGoes() {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [seen, setSeen] = useState(false);
  const swipeFrom = useRef<number | null>(null);

  useEffect(() => (root.current ? whenSeen(root.current, () => setSeen(true), 0.4) : undefined), []);

  useEffect(() => {
    if (!playing || !seen) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % STEPS.length), ADVANCE_MS);
    return () => clearInterval(id);
  }, [playing, seen]);

  // The show for each step, and the Song sticker's equalizer while the section is on screen.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = root.current;
        if (!el || !seen) return;
        const q = gsap.utils.selector(el);
        const phone = q(`[data-step-phone="${index}"]`);
        gsap.fromTo(phone, { y: 110, rotation: 7, scale: 0.9 }, { y: 0, rotation: 0, scale: 1, duration: 0.8, ease: "back.out(1.6)" });
        gsap.fromTo(q("[data-step-title]"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.55, ease: `steps(${STEPS[index]!.title.length})` });
        gsap.fromTo(q("[data-step-body]"), { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.2, ease: "power3.out" });
        gsap.fromTo(q("[data-step-note]"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, delay: 0.3, ease: "steps(20)" });
        const strokes = undrawn(q("[data-step-doodle]"));
        gsap.to(strokes, { strokeDashoffset: 0, duration: 0.7, delay: 0.35, ease: "power2.inOut", stagger: 0.08 });
      });
    },
    { scope: root, dependencies: [index, seen] },
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!seen) return;
        for (const bar of gsap.utils.toArray<HTMLElement>("[data-eq] > span", root.current)) {
          gsap.fromTo(bar, { scaleY: 0.25 }, { scaleY: 1, transformOrigin: "50% 100%", duration: gsap.utils.random(0.25, 0.5), ease: "sine.inOut", yoyo: true, repeat: -1 });
        }
        gsap.to("[data-song-sticker]", { rotation: "+=6", y: "-=6", duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
    },
    { scope: root, dependencies: [seen] },
  );

  const step = STEPS[index]!;
  const go = (delta: number) => {
    setPlaying(false);
    setIndex((i) => (i + delta + STEPS.length) % STEPS.length);
  };

  // Phones: a sideways swipe on the stage moves a step.
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") swipeFrom.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipeFrom.current === null) return;
    const dx = e.clientX - swipeFrom.current;
    swipeFrom.current = null;
    if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
  };

  return (
    <section ref={root} id="how" aria-labelledby="how-title" className="mx-auto mt-24 max-w-6xl scroll-mt-24 px-5 sm:mt-32 sm:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
        <div>
          <h2 id="how-title" className="text-[15px] font-semibold tracking-[0.02em] text-ink uppercase">
            How it goes
          </h2>
          <p className="mt-2 text-[15px] leading-snug text-ink">What they see, from your link to their answer.</p>

          {/* The number rolls to the step like an odometer; the text beside it is what's announced. */}
          <p className="mt-10 flex items-baseline font-serif text-[40px] leading-none text-ink">
            <span aria-hidden="true" className="inline-block h-[40px] overflow-hidden">
              <span
                className="block transition-transform duration-500 ease-[cubic-bezier(.3,1.5,.5,1)] motion-reduce:transition-none"
                style={{ transform: `translateY(-${index * 40}px)` }}
              >
                {STEPS.map((_, i) => (
                  <span key={i} className="block h-[40px]">
                    {pad(i + 1)}
                  </span>
                ))}
              </span>
            </span>
            <span className="text-[20px] text-muted" aria-hidden="true">
              /{pad(STEPS.length)}
            </span>
            <span className="sr-only" aria-live="polite">
              Step {index + 1} of {STEPS.length}: {step.title}
            </span>
          </p>
          <h3 data-step-title="" className="mt-3 text-[20px] font-semibold tracking-[0.01em] text-ink uppercase">
            {step.title}
          </h3>
          <p data-step-body="" className="mt-2 min-h-[72px] text-[15px] leading-snug text-ink">
            {step.body}
          </p>

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
        <div
          className="diary-paper relative touch-pan-y overflow-hidden rounded-[22px] border-[3px] border-ink"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeFrom.current = null)}
        >
          <div className="relative mx-auto flex h-[440px] max-w-[520px] items-end justify-center pt-8 sm:h-[480px]">
            {STEPS.map((s, i) => (
              <span
                key={s.src}
                className={`absolute bottom-[-30px] w-[250px] transition-opacity duration-500 sm:w-[270px] ${i === index ? "opacity-100" : "opacity-0"}`}
              >
                <span data-step-phone={i} className="block rounded-t-[34px] border-[1.5px] border-b-0 border-ink bg-card p-[7px] pb-0">
                  <span className="relative block aspect-[390/780] overflow-hidden rounded-t-[27px]">
                    <Image src={s.src} alt="" fill sizes="270px" className="object-cover" style={{ objectPosition: s.position }} />
                  </span>
                </span>
              </span>
            ))}
          </div>

          {/* The Song, playing through every step */}
          <div
            data-song-sticker=""
            aria-hidden="true"
            className="absolute top-6 right-6 flex rotate-3 items-center gap-2 rounded-full border-[1.5px] border-ink bg-card px-3 py-1.5 font-mono text-[12px] text-ink"
          >
            ♪ your song
            <span data-eq="" className="flex h-3.5 items-end gap-[2px]">
              {[0.6, 1, 0.5, 0.8].map((h, i) => (
                <span key={i} className="w-[2.5px] rounded-full bg-rose" style={{ height: `${h * 100}%` }} />
              ))}
            </span>
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 max-sm:hidden">
            <p data-step-note="" className="absolute top-8 left-6 w-28 font-mono text-[12px] leading-snug text-ink">
              {step.note}
            </p>
            <Arrow data-step-doodle="" className="absolute top-20 left-16 w-24 text-ink" />
            <Sparkle className="absolute top-20 right-10 size-7 text-ink" />
            <Heart className="absolute right-16 bottom-20 size-7 text-rose" />
            <Squiggle data-step-doodle="" className="absolute bottom-10 left-8 w-16 text-ink" />
          </div>
        </div>
      </div>
    </section>
  );
}
