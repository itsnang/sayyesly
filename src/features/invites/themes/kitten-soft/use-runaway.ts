"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EDGE_PAD = 18;

/**
 * The runaway "No": the first Dodge pins it where it sits, every later one sends
 * it to a random spot fully on screen, and a resize or rotation never strands it.
 */
export function useRunaway(onDodge: (count: number) => void) {
  const ref = useRef<HTMLButtonElement>(null);
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
    onDodge(n);
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
