"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";
import { burstOn, Particles, undrawn, visible } from "./motion-kit";

gsap.registerPlugin(useGSAP);

/*
 * The hero coming to life, like a notebook page: the doodles draw themselves in
 * ink, the headline writes in, the envelope skids in and wobbles. Then the page
 * stays alive: doodles float, drift away from the cursor, and hovering (or
 * tapping) "Make an invite" or the envelope bursts hearts out of it.
 *
 * It animates what the server rendered, found by data attributes:
 *   [data-doodles] svg  drawn in, then float (and flee the cursor)
 *   [data-hero-line]    written in, one after another
 *   [data-hero-cta]     settles in after the headline
 *   [data-hero-envelope] skids in and wobbles
 *   [data-burst]        bursts on hover / tap ([data-burst-jump] also jumps)
 * Nothing moves with "reduce motion" on; globals.css shows everything if this never runs.
 */

const REPEL_RADIUS = 160;
const REPEL_PUSH = 46;

type Anchor = { el: SVGSVGElement; x: number; y: number; toX: gsap.QuickToFunc; toY: gsap.QuickToFunc };

export function HeroMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", fine: "(pointer: fine)" }, (context) => {
        const { motion, fine } = context.conditions as { motion: boolean; fine: boolean };
        if (!motion || !root.current) return;
        const el: HTMLElement = root.current;
        const q = gsap.utils.selector(el);

        // Doodles hidden by the layout (e.g. the wide-screen arc on phones) are skipped.
        const doodles = visible(q("[data-doodles] svg") as unknown as SVGSVGElement[]);
        const strokes = undrawn(doodles);
        // Coloured blobs carry their fill on the path; it washes in once the outline is drawn.
        const filled = strokes.filter((s) => (s.getAttribute("fill") ?? "none") !== "none");
        gsap.set(filled, { fillOpacity: 0 });

        // GSAP folds the page's own CSS tilt (e.g. the envelope's -8°) into its rotation, so
        // everything moves relative to where it rests rather than back to 0.
        const envelope = q("[data-hero-envelope]");
        const envelopeTilt = Number(gsap.getProperty(envelope[0] ?? {}, "rotation")) || 0;

        const intro = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: startIdle });
        intro
          .set([...doodles, ...q("[data-hero-envelope]")], { autoAlpha: 1 }, 0)
          .to(strokes, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", stagger: { each: 0.05, from: "random" } }, 0)
          .to(filled, { fillOpacity: 1, duration: 0.45, stagger: 0.05 }, 0.55)
          .fromTo(q("[data-hero-line]"), { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.14 }, 0.1)
          .fromTo(q("[data-hero-cta]"), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 0.5)
          .from(envelope, { x: "+=140", rotation: "+=28", duration: 0.8, ease: "back.out(1.7)" }, 0.65)
          .to(envelope, { rotation: envelopeTilt - 7, duration: 0.1, yoyo: true, repeat: 3, ease: "sine.inOut" });

        // After the intro: a gentle float on every doodle, and on a mouse they drift away from the cursor.
        const cleanups: (() => void)[] = [];
        function startIdle() {
          for (const d of doodles) {
            gsap.to(d, {
              yPercent: gsap.utils.random(-16, 16),
              rotation: `+=${gsap.utils.random(-9, 9)}`,
              duration: gsap.utils.random(2.2, 3.8),
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: gsap.utils.random(0, 0.8),
            });
          }
          if (fine) cleanups.push(repelFromCursor(el, doodles));
          cleanups.push(burstOn(el, q("[data-burst]")));
        }

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

/** Doodles near the cursor slide away from it, and drift back when it leaves. Returns the cleanup. */
function repelFromCursor(root: HTMLElement, doodles: SVGSVGElement[]): () => void {
  let anchors: Anchor[] = [];
  // Where each doodle rests, in page coordinates (measured once, and again on resize).
  const measure = () => {
    anchors = doodles.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        x: r.left + r.width / 2 + window.scrollX,
        y: r.top + r.height / 2 + window.scrollY,
        toX: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" }),
        toY: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" }),
      };
    });
  };
  const onMove = (e: PointerEvent) => {
    for (const a of anchors) {
      const dx = a.x - e.pageX;
      const dy = a.y - e.pageY;
      const dist = Math.hypot(dx, dy) || 1;
      const push = dist < REPEL_RADIUS ? (1 - dist / REPEL_RADIUS) * REPEL_PUSH : 0;
      a.toX((dx / dist) * push);
      a.toY((dy / dist) * push);
    }
  };
  const onLeave = () => anchors.forEach((a) => (a.toX(0), a.toY(0)));

  measure();
  window.addEventListener("resize", measure);
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  return () => {
    window.removeEventListener("resize", measure);
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
  };
}
