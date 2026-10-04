"use client";

// PROTOTYPE: mounts one variant and the floating switcher (← / → keys or the arrows).
// The switcher sits at the top: Next's dev badge and the variants' own controls use the bottom.
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { VariantA } from "./variant-a";
import { VariantB } from "./variant-b";
import { VariantC } from "./variant-c";
import { VariantD } from "./variant-d";
import { VariantE } from "./variant-e";

const VARIANTS = [
  { key: "A", name: "Snap the elastic · ask first, sideways pages", Component: VariantA },
  { key: "B", name: "Turn the pages · swipe right to left, question last", Component: VariantB },
  { key: "C", name: "One long scrapbook · scroll, no pages", Component: VariantC },
  { key: "D", name: "Dear diary · a letter, question as the P.S.", Component: VariantD },
  { key: "E", name: "Spiral photo notebook · tap a photo to open a chapter", Component: VariantE },
];

export function Prototype({ variant }: { variant: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const index = Math.max(0, VARIANTS.findIndex((v) => v.key === variant));
  const current = VARIANTS[index] ?? VARIANTS[0]!;
  const [state, setState] = useState("");
  const report = useCallback((s: string) => setState(s), []);

  const go = useCallback(
    (step: number) => {
      const target = VARIANTS[(index + step + VARIANTS.length) % VARIANTS.length]!;
      router.replace(`${pathname}?variant=${target.key}`, { scroll: true });
    },
    [index, pathname, router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target;
      if (el instanceof HTMLElement && (el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const Variant = current.Component;
  return (
    <>
      <Variant key={current.key} report={report} />
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: 8,
          transform: "translateX(-50%)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          borderRadius: 999,
          background: "#111",
          color: "#fff",
          font: "12px/1.3 ui-monospace, monospace",
          boxShadow: "0 6px 20px rgba(0,0,0,.35)",
          maxWidth: "calc(100vw - 16px)",
        }}
      >
        <button type="button" onClick={() => go(-1)} aria-label="Previous variant" style={arrow}>‹</button>
        <div style={{ textAlign: "center", minWidth: 0 }}>
          <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {current.key} ({current.name})
          </div>
          <div style={{ opacity: 0.65, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{state}</div>
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Next variant" style={arrow}>›</button>
      </div>
    </>
  );
}

const arrow = { width: 30, height: 30, borderRadius: 30, border: 0, background: "#333", color: "#fff", fontSize: 18, cursor: "pointer" } as const;
