"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EDGE_PAD = 18;

/**
 * The control that gets away. The first dodge pins it where it sits; every later
 * one sends it to a random spot that keeps it fully on screen, including after
 * the viewport is rotated or resized. Attach `ref` to the element, spread
 * `style` on it, and call `dodge` from its hover/tap handlers.
 */
export function useRunaway<T extends HTMLElement>(onDodge?: (count: number) => void) {
  const ref = useRef<T>(null);
  const [dodges, setDodges] = useState(0);
  const [loose, setLoose] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  const randomSpot = useCallback(() => {
    const w = ref.current?.offsetWidth ?? 80;
    const h = ref.current?.offsetHeight ?? 50;
    const maxX = window.innerWidth - w - EDGE_PAD;
    const maxY = window.innerHeight - h - EDGE_PAD;
    return {
      left: EDGE_PAD + Math.random() * Math.max(maxX - EDGE_PAD, 0),
      top: EDGE_PAD + Math.random() * Math.max(maxY - EDGE_PAD, 0),
    };
  }, []);

  const dodge = useCallback(() => {
    const n = dodges + 1;
    setDodges(n);
    onDodge?.(n);
    if (!loose && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ left: r.left, top: r.top });
      setLoose(true);
    } else {
      setPos(randomSpot());
    }
  }, [dodges, loose, onDodge, randomSpot]);

  useEffect(() => {
    if (!loose) return;
    const keepInside = () =>
      setPos((p) => {
        const w = ref.current?.offsetWidth ?? 80;
        const h = ref.current?.offsetHeight ?? 50;
        return {
          left: Math.min(Math.max(p.left, EDGE_PAD), Math.max(window.innerWidth - w - EDGE_PAD, EDGE_PAD)),
          top: Math.min(Math.max(p.top, EDGE_PAD), Math.max(window.innerHeight - h - EDGE_PAD, EDGE_PAD)),
        };
      });
    window.addEventListener("resize", keepInside);
    return () => window.removeEventListener("resize", keepInside);
  }, [loose]);

  const style = loose
    ? ({ position: "fixed", left: pos.left, top: pos.top } as const)
    : ({ position: "relative" } as const);

  return { ref, dodges, loose, dodge, style };
}
