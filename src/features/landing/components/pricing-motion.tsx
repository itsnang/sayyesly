"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";
import { visible, whenSeen } from "./motion-kit";

gsap.registerPlugin(useGSAP);

/*
 * The receipts print once they're seen: each one feeds out from the top, one
 * after the other, and the doodles pop last. Kept calm on purpose: it's the
 * page about money. Parts: [data-receipt], [data-pop] doodles.
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
        const doodles = visible([...el.querySelectorAll<HTMLElement>("[data-pop]")]);
        gsap.set(receipts, { clipPath: "inset(0 0 100% 0)" });
        gsap.set(doodles, { autoAlpha: 0 });

        const play = () => {
          gsap
            .timeline()
            // The zig-zag edge sits just outside the box, so the clip opens past it, then goes.
            .to(receipts, { clipPath: "inset(0 0 -16px 0)", duration: 0.9, ease: "power2.out", stagger: 0.3, clearProps: "clipPath" })
            .set(doodles, { autoAlpha: 1 })
            .from(doodles, { autoAlpha: 0, scale: 0, duration: 0.4, ease: "back.out(2)", stagger: 0.08 });
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
