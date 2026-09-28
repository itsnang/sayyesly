"use client";

import { useEffect, useState } from "react";

/**
 * True from the Recipient's first touch, click or key press anywhere on the
 * page, for Themes that start their Song then. Browsers only allow sound after one.
 */
export function useFirstTap(enabled: boolean): boolean {
  const [tapped, setTapped] = useState(false);
  useEffect(() => {
    if (!enabled || tapped) return;
    const onTap = () => setTapped(true);
    // Capture phase: counts even when the tap lands on a button that stops it.
    document.addEventListener("pointerdown", onTap, { capture: true, once: true });
    document.addEventListener("keydown", onTap, { capture: true, once: true });
    return () => {
      document.removeEventListener("pointerdown", onTap, { capture: true });
      document.removeEventListener("keydown", onTap, { capture: true });
    };
  }, [enabled, tapped]);
  return tapped;
}
