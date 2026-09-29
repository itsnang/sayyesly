"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";
import { visible, whenSeen } from "./motion-kit";

gsap.registerPlugin(useGSAP);

/*
 * The receipts print once they're seen: each one feeds out line by line with a
 * little till shake, then a rubber stamp thumps onto it. Doodles pop last.
 * Parts: [data-receipt] (each with a [data-receipt-stamp]), [data-pop] doodles.
 */

export function PricingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = root.current;
        if (!el) return;
        const receipts = visible([...el.querySelectorAll<HTMLElement>("[data-receipt]")]);
        const stamps = receipts.map((r) => r.querySelector<HTMLElement>("[data-receipt-stamp]"));
        const doodles = visible([...el.querySelectorAll<HTMLElement>("[data-pop]")]);
        gsap.set(receipts, { clipPath: "inset(0 0 100% 0)" });
        gsap.set([...stamps, ...doodles], { autoAlpha: 0 });

        const play = () => {
          const scene = gsap.timeline();
          receipts.forEach((receipt, i) => {
            const at = i * 0.9;
            // Printing: the paper feeds out in steps (the zig-zag edge is outside the box, so the clip goes past it) while the till shakes.
            scene
              .to(receipt, { clipPath: "inset(0 0 -16px 0)", duration: 1.5, ease: "steps(16)" }, at)
              .fromTo(receipt, { x: -1.5 }, { x: 1.5, duration: 0.05, repeat: 29, yoyo: true, ease: "none" }, at)
              .set(receipt, { x: 0, clearProps: "clipPath" }, at + 1.5);
            const stamp = stamps[i];
            if (stamp) {
              scene
                .set(stamp, { autoAlpha: 1 }, at + 1.55)
                .from(stamp, { autoAlpha: 0, scale: 2.8, rotation: "-=20", duration: 0.3, ease: "power4.in" }, at + 1.55)
                .fromTo(receipt, { y: 0 }, { y: 5, duration: 0.07, yoyo: true, repeat: 1 }, at + 1.85);
            }
          });
          scene.set(doodles, { autoAlpha: 1 }).from(doodles, { autoAlpha: 0, scale: 0, duration: 0.5, ease: "back.out(3)", stagger: 0.1 });
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
