"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";
import { burstOn, Particles, undrawn, visible, whenSeen } from "./motion-kit";

gsap.registerPlugin(useGSAP);

/*
 * The last three sections' motion, each played once it's seen:
 *   StoryMotion    its doodles draw themselves in ink, the envelope glides in, then floats
 *   FaqMotion      answers slide open and closed instead of jumping
 *   ClosingMotion  "Go on. Ask them." bounces in letter by letter, the sparkle spins,
 *                  and "Make an invite" bursts hearts on hover or tap
 * Nothing moves with "reduce motion" on (the FAQ then opens the browser's own way).
 */

/** `className` lays out its box (it is the doodle layer), which is also what must come into view. */
export function StoryMotion({ children, className }: { children: ReactNode; className: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = root.current;
        if (!el) return;
        const doodles = visible([...el.querySelectorAll<SVGSVGElement>("[data-story-doodle]")]);
        const envelope = el.querySelector<SVGSVGElement>("[data-story-envelope]");
        const strokes = undrawn(doodles);
        const filled = strokes.filter((s) => (s.getAttribute("fill") ?? "none") !== "none");
        gsap.set(filled, { fillOpacity: 0 });
        if (envelope) gsap.set(envelope, { autoAlpha: 0 });

        const play = () => {
          const scene = gsap
            .timeline()
            .to(strokes, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut", stagger: { each: 0.1, from: "random" } })
            .to(filled, { fillOpacity: 1, duration: 0.4, stagger: 0.08 }, 0.7);
          if (envelope) {
            scene
              .set(envelope, { autoAlpha: 1 }, 0.2)
              .from(envelope, { x: "-=180", y: "+=40", rotation: "-=30", duration: 1.2, ease: "power3.out" }, 0.2)
              .to(envelope, { y: "-=10", rotation: "+=4", duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
          }
        };
        return whenSeen(el, play);
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} aria-hidden="true" className={className}>
      {children}
    </div>
  );
}

export function FaqMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = root.current;
        if (!el || !contextSafe) return;
        const items = [...el.querySelectorAll<HTMLDetailsElement>("details")];
        const handlers = items.map((details) => {
          const summary = details.querySelector("summary");
          const answer = details.querySelector<HTMLElement>("[data-answer]");
          const onClick = contextSafe((e: Event) => {
            if (!answer) return;
            e.preventDefault();
            gsap.killTweensOf(answer);
            if (!details.open) {
              details.open = true;
              gsap.fromTo(answer, { height: 0, autoAlpha: 0 }, { height: "auto", autoAlpha: 1, duration: 0.4, ease: "power3.out", clearProps: "height" });
            } else {
              gsap.to(answer, {
                height: 0,
                autoAlpha: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                  details.open = false;
                  gsap.set(answer, { clearProps: "height,opacity,visibility" });
                },
              });
            }
          });
          summary?.addEventListener("click", onClick);
          return () => summary?.removeEventListener("click", onClick);
        });
        return () => handlers.forEach((h) => h());
      });
    },
    { scope: root },
  );
  return <div ref={root}>{children}</div>;
}

export function ClosingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = root.current;
        if (!el) return;
        const letters = [...el.querySelectorAll<HTMLElement>("[data-letter]")];
        const sparkle = el.querySelector("[data-closing-sparkle]");
        gsap.set(letters, { autoAlpha: 0 });
        const cleanups: (() => void)[] = [burstOn(el, [...el.querySelectorAll("[data-burst]")])];

        const play = () => {
          gsap.set(letters, { autoAlpha: 1 });
          gsap
            .timeline()
            .from(letters, { autoAlpha: 0, y: -70, rotation: () => gsap.utils.random(-30, 30), duration: 0.9, ease: "bounce.out", stagger: 0.035 })
            .fromTo(sparkle, { rotation: 0, scale: 0.4 }, { rotation: 360, scale: 1, duration: 1, ease: "back.out(2)" }, 0);
          gsap.to(sparkle, { rotation: "+=360", duration: 12, ease: "none", repeat: -1, delay: 1 });
        };
        cleanups.push(whenSeen(el, play, 0.5));
        return () => cleanups.forEach((c) => c());
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} className="relative">
      {children}
      <Particles />
    </div>
  );
}
