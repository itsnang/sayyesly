"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";
import { undrawn, visible, whenSeen } from "./motion-kit";

gsap.registerPlugin(useGSAP);

/*
 * The studio mock as a demo reel, looping once it's seen: the question types
 * itself, "dinner" gets highlighted, the Theme switches from Kitten Soft to
 * Envelope (the phone with it), then the Song's part slides into place and the
 * playhead runs through it. The notes around the mock type in and their arrows
 * draw. It animates StudioMock's [data-studio] parts and the [data-studio-note]s.
 * Nothing moves with "reduce motion" on; the static mock is the finished state.
 */

const TRANSPARENT = "rgba(0, 0, 0, 0)";

export function StudioMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = root.current;
        if (!el) return;
        const one = (name: string) => el.querySelector<HTMLElement>(`[data-studio="${name}"]`);
        const typed = one("typed");
        const highlight = one("highlight");
        const song = one("song");
        const part = one("part");
        const playhead = one("playhead");
        const kittenRing = el.querySelector("[data-ring='kitten']");
        const envelopeRing = el.querySelector("[data-ring='envelope']");
        const before = el.querySelector("[data-screen-before]");

        const notes = visible([...el.querySelectorAll<HTMLElement>("[data-studio-note]")]);
        const noteTexts = notes.map((n) => n.querySelector("p"));
        const noteArrows = undrawn(notes.flatMap((n) => [...n.querySelectorAll("svg")]));
        gsap.set(noteTexts, { clipPath: "inset(0 100% 0 0)" });

        // The highlight's own look, to switch off and back on.
        const lit = highlight ? getComputedStyle(highlight) : null;
        const on = lit ? { backgroundColor: lit.backgroundColor, color: lit.color, textDecorationColor: lit.textDecorationColor } : {};
        const off = lit ? { backgroundColor: TRANSPARENT, color: getComputedStyle(highlight!.parentElement!).color, textDecorationColor: TRANSPARENT } : {};

        const play = () => {
          gsap
            .timeline()
            .to(noteTexts, { clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "steps(24)", stagger: 0.5 })
            .to(noteArrows, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut", stagger: 0.4 }, 0.4);

          const reel = gsap.timeline({ repeat: -1, repeatDelay: 1.6, defaults: { ease: "power3.out" } });
          // Back to the start of the story: nothing typed, nothing highlighted, the free Theme, the part not placed.
          reel
            .set(typed, { clipPath: "inset(0 100% 0 0)" }, 0)
            .set(highlight, off, 0)
            .set(kittenRing, { autoAlpha: 1, scale: 1 }, 0)
            .set(envelopeRing, { autoAlpha: 0 }, 0)
            .set(before, { autoAlpha: 1 }, 0)
            .set(part, { xPercent: -120, autoAlpha: 0 }, 0)
            .set(playhead, { left: "0%", autoAlpha: 0 }, 0)
            // 1. The question types itself.
            .to(typed, { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "steps(28)" }, 0.2)
            // 2. A word gets highlighted.
            .to(highlight, { ...on, duration: 0.25 }, 1.6)
            .fromTo(highlight, { scale: 1 }, { scale: 1.25, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" }, 1.6);

          // 3. Trying the Envelope on: the ring moves and the phone changes (only while Envelope is on sale).
          if (envelopeRing) {
            reel
              .to(kittenRing, { autoAlpha: 0, duration: 0.2 }, 2.5)
              .fromTo(envelopeRing, { autoAlpha: 0, scale: 1.35 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.5)" }, 2.5)
              .to(before, { autoAlpha: 0, duration: 0.5, ease: "power1.inOut" }, 2.55);
          }

          // 4. The Song: the part slides into place, the row glows, and the playhead runs through it.
          reel
            .to(part, { xPercent: 0, autoAlpha: 1, duration: 0.7, ease: "back.out(1.4)" }, 3.4)
            .fromTo(song, { backgroundColor: TRANSPARENT }, { backgroundColor: "rgba(232, 90, 120, 0.08)", duration: 0.3, yoyo: true, repeat: 1 }, 3.4)
            .set(playhead, { autoAlpha: 1 }, 4.1)
            .to(playhead, { left: "calc(100% - 2px)", duration: 1.6, ease: "none", repeat: 1 }, 4.1);
        };

        return whenSeen(el, play);
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      {children}
    </div>
  );
}
