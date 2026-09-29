"use client";

import gsap from "gsap";
import { Heart, Sparkle, Star } from "@/components/shared/doodles";

// Shared parts of the landing page's motion (GSAP): playing a scene once it's
// seen, ink strokes that draw themselves, the heart burst, and paper that
// lifts under the cursor.

/**
 * Calls `play` once, the first time `el` is at least `threshold` in view.
 * Without IntersectionObserver it plays at once, so nothing can stay hidden. Returns the cleanup.
 */
export function whenSeen(el: Element, play: () => void, threshold = 0.3): () => void {
  if (typeof IntersectionObserver === "undefined") {
    play();
    return () => {};
  }
  const seen = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        seen.disconnect();
        play();
      }
    },
    { threshold },
  );
  seen.observe(el);
  return () => seen.disconnect();
}

/** The paths of these SVGs, set up to be drawn (a tween to `strokeDashoffset: 0` draws them). */
export function undrawn(svgs: Element[]): SVGGeometryElement[] {
  const strokes = svgs.flatMap((svg) => [...svg.querySelectorAll<SVGGeometryElement>("path, circle, ellipse")]);
  for (const s of strokes) {
    const length = s.getTotalLength();
    gsap.set(s, { strokeDasharray: length, strokeDashoffset: length });
  }
  return strokes;
}

/** Elements that are actually laid out (not `display: none` at this screen size). */
export const visible = <T extends Element>(els: T[]) => els.filter((el) => el.getClientRects().length > 0);

/** The pieces a burst throws: hearts, sparkles and stars, hidden until used. Put it inside the burst's root. */
export function Particles({ count = 28 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-visible">
      {Array.from({ length: count }, (_, i) => {
        const Shape = i % 3 === 0 ? Sparkle : i % 3 === 1 ? Heart : Star;
        return <Shape key={i} data-particle="" className={`invisible absolute top-0 left-0 size-6 ${i % 3 === 1 ? "text-rose" : "text-ink"}`} />;
      })}
    </div>
  );
}

const PER_BURST = 14;

/**
 * Hovering (or tapping) one of `targets` throws hearts and sparkles out of it,
 * using the `Particles` inside `root`. Returns the cleanup.
 */
export function burstOn(root: HTMLElement, targets: Element[]): () => void {
  const particles = [...root.querySelectorAll("[data-particle]")];
  if (particles.length === 0) return () => {};
  let next = 0;
  const last = new WeakMap<Element, number>();

  const burst = (target: Element) => {
    const now = performance.now();
    if (now - (last.get(target) ?? 0) < 700) return;
    last.set(target, now);

    const box = root.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const cx = r.left + r.width / 2 - box.left;
    const cy = r.top + r.height / 2 - box.top;
    for (let i = 0; i < PER_BURST; i++) {
      const p = particles[next++ % particles.length]!;
      const angle = (i / PER_BURST) * Math.PI * 2 + gsap.utils.random(-0.25, 0.25);
      const distance = gsap.utils.random(80, 170);
      const duration = gsap.utils.random(1, 1.4);
      gsap.killTweensOf(p);
      gsap.fromTo(
        p,
        { x: cx, y: cy, xPercent: -50, yPercent: -50, scale: 0, rotation: 0, autoAlpha: 1 },
        {
          x: cx + Math.cos(angle) * distance,
          y: cy + Math.sin(angle) * distance - 30,
          scale: gsap.utils.random(0.8, 1.5),
          rotation: gsap.utils.random(-160, 160),
          duration,
          ease: "expo.out",
        },
      );
      // Flies out at full strength, then fades as it slows.
      gsap.to(p, { autoAlpha: 0, duration: 0.45, delay: duration - 0.45, ease: "power1.in" });
    }
    // A target that asks for it also gives a little jump.
    if (target.matches("[data-burst-jump]")) {
      gsap.fromTo(target, { y: 0 }, { y: -10, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" });
    }
  };

  const handlers = targets.map((t) => {
    const onEnter = () => burst(t);
    t.addEventListener("pointerenter", onEnter);
    t.addEventListener("pointerdown", onEnter);
    return () => {
      t.removeEventListener("pointerenter", onEnter);
      t.removeEventListener("pointerdown", onEnter);
    };
  });
  return () => handlers.forEach((h) => h());
}

/** A paper card straightens and lifts off the page under the cursor, then settles back. */
export function liftOnHover(cards: HTMLElement[]): () => void {
  const handlers = cards.map((card) => {
    // Held up it's straight; let go, it falls back to its own tilt (GSAP has taken over the CSS `rotate`).
    const tilt = Number(gsap.getProperty(card, "rotation")) || 0;
    const shadow = getComputedStyle(card).boxShadow;
    const up = () => gsap.to(card, { rotation: 0, y: -14, scale: 1.06, zIndex: 10, boxShadow: "0 26px 40px -18px rgba(60,30,20,0.55)", duration: 0.35, ease: "back.out(2)" });
    const down = () => gsap.to(card, { rotation: tilt, y: 0, scale: 1, zIndex: 0, boxShadow: shadow, duration: 0.45, ease: "power3.out" });
    card.addEventListener("pointerenter", up);
    card.addEventListener("pointerleave", down);
    return () => {
      card.removeEventListener("pointerenter", up);
      card.removeEventListener("pointerleave", down);
    };
  });
  return () => handlers.forEach((h) => h());
}
