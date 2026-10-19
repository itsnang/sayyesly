"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { formatInZone as formatShared } from "../shared/format";

/** SVG filter that gives borders and underlines their hand-drawn wobble. Render once per screen. */
export function WobbleFilter() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
      <defs>
        <filter id="wobble">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.022" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={3} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/** The wobbly accent underline drawn under emphasised words. */
export function Squiggle({ bottom = -16, height = 16 }: { bottom?: number; height?: number }) {
  return (
    <svg
      viewBox="0 0 120 16"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: "-4%", bottom, width: "108%", height, filter: "url(#wobble)" }}
    >
      <path
        d="M3 9 C30 15 60 3 90 9 C103 12 112 10 117 7"
        fill="none"
        stroke="#e23a7a"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The hand-drawn outline laid over buttons and cards. */
export function WobblyBorder({ color = "var(--line)", radius = 11, shadow = "3px 4px 0 rgba(138,45,92,0.14)" }: {
  color?: string;
  radius?: number;
  shadow?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        border: `2.4px solid ${color}`,
        borderRadius: radius,
        filter: "url(#wobble)",
        boxShadow: shadow,
      }}
    />
  );
}

export function PillButton({
  selected,
  onClick,
  children,
  style,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        fontFamily: "var(--marker)",
        cursor: "pointer",
        background: selected ? "var(--accent)" : "var(--paper)",
        border: "none",
        padding: "9px 18px",
        fontSize: 15,
        color: selected ? "#fff" : "var(--ink)",
        position: "relative",
        borderRadius: 11,
        transition: "transform .15s cubic-bezier(.2,.9,.3,1.3)",
        ...style,
      }}
    >
      <WobblyBorder color={selected ? "var(--accent)" : "var(--line)"} />
      {children}
    </button>
  );
}

export function Prompt({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--hand)",
        fontSize: 17,
        color: "var(--ink-soft)",
        margin: "28px 0 10px",
        textAlign: "center",
      }}
    >
      {children}
    </p>
  );
}

type Scrap = {
  id: number;
  mark: string;
  color: string;
  left: string;
  fontSize: number;
  rot: number;
  dur: number;
  delay: number;
};

const MARKS = ["♥", "♡", "♥", "✦"];
const COLORS = ["var(--accent)", "var(--accent-2)"];
/** One light shower: enough to feel happy, never enough to hide the page. */
const BURST = 16;
let scrapId = 0;

const pick = <T,>(items: readonly T[], fallback: T): T => items[Math.floor(Math.random() * items.length)] ?? fallback;

/** A light shower of hearts. `celebrate()` lets one fall. */
export function useRain() {
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const celebrate = useCallback(() => {
    const batch: Scrap[] = Array.from({ length: BURST }, () => ({
      id: ++scrapId,
      mark: pick(MARKS, "♥"),
      color: pick(COLORS, "var(--accent)"),
      left: Math.random() * 100 + "vw",
      fontSize: 14 + Math.random() * 12,
      rot: Math.random() * 240 - 120,
      dur: 3.4 + Math.random() * 2,
      delay: Math.random() * 1.2,
    }));
    setScraps((prev) => [...prev, ...batch]);
    timers.current.push(
      setTimeout(() => setScraps((prev) => prev.filter((s) => !batch.some((b) => b.id === s.id))), 7000),
    );
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const layer = (
    <>
      {scraps.map((s) => (
        <div
          key={s.id}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: -30,
            left: s.left,
            fontSize: s.fontSize,
            color: s.color,
            fontFamily: "var(--hand)",
            zIndex: 45,
            opacity: 0.8,
            pointerEvents: "none",
            animation: `drop ${s.dur.toFixed(2)}s linear ${s.delay.toFixed(2)}s forwards`,
            ["--rot" as string]: `${s.rot}deg`,
          }}
        >
          {s.mark}
        </div>
      ))}
    </>
  );

  return { celebrate, layer };
}

/** Keyframes shared by every kitten-soft screen. */
export function KittenKeyframes() {
  return (
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(-.4deg); }
        50%       { transform: translateY(-9px) rotate(.4deg); }
      }
      @keyframes settle {
        from { opacity: 0; transform: translateY(16px) rotate(-.6deg); }
        to   { opacity: 1; transform: none; }
      }
      @keyframes pop {
        from { transform: scale(0) rotate(-30deg); opacity: 0; }
        to   { transform: scale(1) rotate(0); opacity: 1; }
      }
      @keyframes drop {
        to { transform: translateY(116vh) rotate(var(--rot, 200deg)); }
      }
      /* the kitten's reactions (kitten.tsx) */
      @keyframes kitten-lean {
        to { transform: translateY(-6px) scale(1.05) rotate(2deg); }
      }
      @keyframes kitten-shake {
        0%, 100% { transform: none; }
        20% { transform: translateX(-8px) rotate(-4deg); }
        40% { transform: translateX(7px) rotate(3deg); }
        60% { transform: translateX(-5px) rotate(-2deg); }
        80% { transform: translateX(3px); }
      }
      @keyframes kitten-droop {
        to { transform: translateY(8px) rotate(-5deg) scale(.97); }
      }
      @keyframes kitten-hop {
        0%, 100% { transform: none; }
        30% { transform: translateY(-34px) scale(1.06) rotate(-4deg); }
        55% { transform: translateY(0) scale(1.08, .92); }
        75% { transform: translateY(-12px) rotate(3deg); }
      }
      @keyframes kitten-wave {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(4deg); }
      }
      @keyframes heart-rise {
        0% { transform: translateY(0) scale(.6); opacity: 0; }
        15% { opacity: 1; }
        100% { transform: translateY(-140px) scale(1.1) rotate(12deg); opacity: 0; }
      }
      @keyframes twinkle {
        0%, 100% { opacity: .25; transform: scale(.8); }
        50% { opacity: 1; transform: scale(1.15) rotate(20deg); }
      }
      @keyframes paw-fade {
        0% { opacity: 0; transform: scale(.6); }
        20% { opacity: 1; transform: none; }
        100% { opacity: 0; }
      }
      /* "hover" means nothing on a phone */
      .hint-touch { display: none; }
      @media (hover: none) {
        .hint-hover { display: none; }
        .hint-touch { display: inline; }
      }
      @media (prefers-reduced-motion: reduce) {
        .kitten-soft *, .kitten-soft *::before, .kitten-soft *::after {
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
        }
      }
      @media (max-width: 860px) {
        .note { display: none !important; }
      }
    `}</style>
  );
}

/** An instant in the Invite's time zone, in kitten-soft's lowercase voice. */
export function formatInZone(iso: string, timeZone: string) {
  const f = formatShared(iso, timeZone);
  return { date: f.date.toLowerCase(), weekday: f.weekdayShort.toLowerCase(), time: f.time.toLowerCase() };
}

