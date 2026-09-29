"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";
import { liftOnHover, visible, whenSeen } from "./motion-kit";

gsap.registerPlugin(useGSAP);

/*
 * The Themes board, dealt onto the table once it's seen: each polaroid spins in
 * from below and lands at its own angle, the sticky note slaps down, the "new"
 * stamp thumps onto the Envelope photo (which gives a jolt), and the doodles
 * pop. Afterwards a polaroid straightens and lifts under the cursor.
 * Parts: [data-deal] photos, [data-sticky], [data-stamp], [data-pop] doodles.
 */

export function ThemesMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", fine: "(pointer: fine)" }, (context) => {
        const { motion, fine } = context.conditions as { motion: boolean; fine: boolean };
        const el = root.current;
        if (!motion || !el) return;
        const q = (s: string) => visible([...el.querySelectorAll<HTMLElement>(s)]);
        const photos = q("[data-deal]");
        const sticky = q("[data-sticky]");
        const stamps = q("[data-stamp]");
        const doodles = q("[data-pop]");
        gsap.set([...photos, ...sticky, ...stamps, ...doodles], { autoAlpha: 0 });

        const cleanups: (() => void)[] = [];
        const play = () => {
          gsap.set([...photos, ...sticky, ...stamps, ...doodles], { autoAlpha: 1 });
          gsap
            .timeline({ defaults: { ease: "power4.out" }, onComplete: () => fine && cleanups.push(liftOnHover(q("[data-lift]"))) })
            .from(photos, {
              autoAlpha: 0,
              y: "+=260",
              x: (i) => `+=${(i % 2 === 0 ? -1 : 1) * gsap.utils.random(40, 120)}`,
              rotation: (i) => `+=${(i % 2 === 0 ? -1 : 1) * gsap.utils.random(35, 60)}`,
              duration: 0.9,
              stagger: 0.18,
            })
            .from(sticky, { autoAlpha: 0, scale: 1.5, rotation: "-=14", duration: 0.45, ease: "back.out(2.2)" }, 0.6)
            .from(stamps, { autoAlpha: 0, scale: 3, rotation: "-=25", duration: 0.35, ease: "power4.in" }, 1.05)
            // The stamp lands: the photo under it takes the hit.
            .add(() => {
              for (const stamp of stamps) {
                const photo = stamp.closest("[data-deal]");
                if (photo) gsap.fromTo(photo, { y: 0 }, { y: 6, duration: 0.08, yoyo: true, repeat: 1, ease: "power2.out" });
              }
            }, 1.4)
            .from(doodles, { autoAlpha: 0, scale: 0, duration: 0.5, ease: "back.out(3)", stagger: 0.1 }, 1.2);
        };

        cleanups.push(whenSeen(el, play));
        return () => cleanups.forEach((c) => c());
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
