"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";
import { Heart } from "@/components/shared/doodles";

gsap.registerPlugin(useGSAP);

/*
 * The scrapbook collage as a little scene, played once when it comes into
 * view: the phone drops onto the page, the paper cards slap down, the tape
 * stretches over them, the note types itself and its arrow draws, and the
 * Telegram messages fly out of the phone one by one. Then it stays alive: the
 * phone bobs and tilts towards the cursor, a message pings every few seconds
 * with a heart from the phone, and a card straightens and lifts under the cursor.
 *
 * Parts are found by data attributes on the server-rendered collage:
 *   [data-sb="phone" | "card" | "tape" | "notif" | "doodle" | "note"]
 * Only the ones actually shown (the layout differs on phones) are animated.
 * Nothing moves with "reduce motion" on.
 */

const PING_EVERY_S = 4.5;

export function ScrapbookMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", fine: "(pointer: fine)" }, (context) => {
        const { motion, fine } = context.conditions as { motion: boolean; fine: boolean };
        if (!motion || !root.current) return;
        const el: HTMLElement = root.current;
        const shown = (name: string) => [...el.querySelectorAll<HTMLElement>(`[data-sb="${name}"]`)].filter((n) => n.getClientRects().length > 0);

        const [found] = shown("phone");
        if (!found) return;
        const phone: HTMLElement = found;
        const cards = shown("card");
        const tapes = shown("tape");
        const notifs = shown("notif");
        const doodles = shown("doodle");
        const notes = shown("note");
        const arrowStrokes = notes.flatMap((n) => [...n.querySelectorAll<SVGGeometryElement>("path")]);

        // Hidden until the scene plays (the collage is below the fold, so nobody sees this step).
        gsap.set([phone, ...cards, ...tapes, ...notifs, ...doodles], { autoAlpha: 0 });
        gsap.set(notes.map((n) => n.querySelector("p")), { clipPath: "inset(0 100% 0 0)" });
        for (const s of arrowStrokes) {
          const length = s.getTotalLength();
          gsap.set(s, { strokeDasharray: length, strokeDashoffset: length });
        }

        const cleanups: (() => void)[] = [];
        const play = () => {
          const phoneBox = phone.getBoundingClientRect();
          const phoneCenter = { x: phoneBox.left + phoneBox.width / 2, y: phoneBox.top + phoneBox.height / 3 };

          // Visible as the resting state, so each `from` below animates in *to* it (they hide again at once).
          gsap.set([phone, ...cards, ...tapes, ...notifs, ...doodles], { autoAlpha: 1 });
          const scene = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: stayAlive });
          scene
            .from(phone, { autoAlpha: 0, y: "-=90", scale: 1.12, rotation: "-=5", duration: 0.9, ease: "bounce.out" }, 0)
            .from(
              cards,
              { autoAlpha: 0, x: (i) => (i % 2 === 0 ? "-=260" : "+=260"), y: "+=120", rotation: (i) => (i % 2 === 0 ? "-=28" : "+=28"), duration: 0.7, ease: "power4.out", stagger: 0.14 },
              0.45,
            )
            .from(tapes, { autoAlpha: 0, scaleX: 0, transformOrigin: "0% 50%", duration: 0.3, stagger: 0.1 }, 0.95)
            .to(notes.map((n) => n.querySelector("p")), { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "steps(28)" }, 0.9)
            .to(arrowStrokes, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 1.7);

          // Each message starts inside the phone and flies out to its place, like a notification arriving.
          notifs.forEach((n, i) => {
            const box = n.getBoundingClientRect();
            scene.from(
              n,
              {
                autoAlpha: 0,
                scale: 0.3,
                x: `+=${phoneCenter.x - (box.left + box.width / 2)}`,
                y: `+=${phoneCenter.y - (box.top + box.height / 2)}`,
                duration: 0.75,
                ease: "back.out(1.5)",
              },
              1.1 + i * 0.45,
            );
          });

          scene.from(doodles, { autoAlpha: 0, scale: 0, duration: 0.5, ease: "back.out(3)", stagger: { each: 0.08, from: "random" } }, 1.3);
        };

        function stayAlive() {
          gsap.to(phone, { y: "-=8", duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
          for (const d of doodles) gsap.to(d, { rotation: `+=${gsap.utils.random(-14, 14)}`, duration: gsap.utils.random(1.8, 3), ease: "sine.inOut", yoyo: true, repeat: -1 });
          if (notifs.length) cleanups.push(pingNotifications(el, phone, notifs));
          if (fine) {
            cleanups.push(tiltTowardsCursor(el, phone));
            cleanups.push(liftOnHover(cards));
          }
        }

        // Without a way to know when it's seen, play at once rather than leave the collage hidden.
        if (typeof IntersectionObserver === "undefined") {
          play();
          return () => cleanups.forEach((c) => c());
        }
        const seen = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              seen.disconnect();
              play();
            }
          },
          { threshold: 0.3 },
        );
        seen.observe(el);

        return () => {
          seen.disconnect();
          cleanups.forEach((c) => c());
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      {children}
      <Heart data-sb-ping="" aria-hidden="true" className="pointer-events-none invisible absolute top-0 left-0 z-20 size-6 text-rose" />
    </div>
  );
}

/** Every few seconds a heart flies from the phone to one of the messages, which gives a little shake. */
function pingNotifications(root: HTMLElement, phone: HTMLElement, notifs: HTMLElement[]): () => void {
  const heart = root.querySelector<SVGSVGElement>("[data-sb-ping]");
  let i = 0;
  const ping = () => {
    const target = notifs[i++ % notifs.length]!;
    const box = root.getBoundingClientRect();
    const from = phone.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const tl = gsap.timeline();
    if (heart) {
      tl.fromTo(
        heart,
        { autoAlpha: 1, scale: 0.4, x: from.left + from.width / 2 - box.left, y: from.top + from.height / 3 - box.top, xPercent: -50, yPercent: -50 },
        { x: to.left + to.width / 2 - box.left, y: to.top - box.top, scale: 1.2, duration: 0.7, ease: "power2.inOut" },
      ).to(heart, { autoAlpha: 0, scale: 0.6, duration: 0.2 });
    }
    const tilt = Number(gsap.getProperty(target, "rotation")) || 0;
    tl.fromTo(target, { rotation: tilt }, { rotation: tilt + 3, duration: 0.08, yoyo: true, repeat: 5, ease: "sine.inOut" }, heart ? 0.6 : 0).fromTo(
      target,
      { scale: 1 },
      { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" },
      "<",
    );
  };
  const timer = gsap.delayedCall(PING_EVERY_S, function repeat() {
    ping();
    timer.restart(true);
  });
  return () => timer.kill();
}

/** The phone leans in 3D towards the cursor while it's over the collage. */
function tiltTowardsCursor(root: HTMLElement, phone: HTMLElement): () => void {
  gsap.set(phone, { transformPerspective: 900 });
  const toX = gsap.quickTo(phone, "rotationY", { duration: 0.6, ease: "power3.out" });
  const toY = gsap.quickTo(phone, "rotationX", { duration: 0.6, ease: "power3.out" });
  const onMove = (e: PointerEvent) => {
    const r = root.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    toX(nx * 18);
    toY(-ny * 12);
  };
  const onLeave = () => (toX(0), toY(0));
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  return () => {
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
  };
}

/** A paper card straightens and lifts off the page under the cursor, then settles back. */
function liftOnHover(cards: HTMLElement[]): () => void {
  const handlers = cards.map((card) => {
    // Held up it's straight; let go, it falls back to its own tilt (GSAP has taken over the CSS `rotate`).
    const tilt = Number(gsap.getProperty(card, "rotation")) || 0;
    const up = () => gsap.to(card, { rotation: 0, y: -14, scale: 1.06, zIndex: 10, boxShadow: "0 26px 40px -18px rgba(60,30,20,0.55)", duration: 0.35, ease: "back.out(2)" });
    const down = () => gsap.to(card, { rotation: tilt, y: 0, scale: 1, zIndex: 0, boxShadow: "0 12px 24px -14px rgba(60,30,20,0.5)", duration: 0.45, ease: "power3.out" });
    card.addEventListener("pointerenter", up);
    card.addEventListener("pointerleave", down);
    return () => {
      card.removeEventListener("pointerenter", up);
      card.removeEventListener("pointerleave", down);
    };
  });
  return () => handlers.forEach((h) => h());
}
