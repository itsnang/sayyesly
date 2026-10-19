"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { type EnumValue } from "@/lib/enums";
import { isOptimizable } from "@/lib/media";

/** How the kitten feels about the answer so far. */
export const Mood = {
  /** Waiting: floats, a sparkle or two. */
  Idle: "idle",
  /** Reaching for Yes: leans in, hearts rise. */
  Hopeful: "hopeful",
  /** "No" just ran off: a shake and a sweat drop. */
  Nervous: "nervous",
  /** "No" keeps running: it droops and asks again. */
  Sad: "sad",
  /** Yes: a happy hop and a burst of hearts. */
  Joy: "joy",
} as const;
export type Mood = EnumValue<typeof Mood>;

/** How many dodges of "No" before the kitten goes from nervous to sad. */
const SAD_AFTER_DODGES = 3;

/** The kitten's mood on the ask screen, from how the Recipient is answering. */
export function moodFor({ dodges, reachingYes, saidYes }: { dodges: number; reachingYes: boolean; saidYes: boolean }): Mood {
  if (saidYes) return Mood.Joy;
  if (reachingYes) return Mood.Hopeful;
  if (dodges >= SAD_AFTER_DODGES) return Mood.Sad;
  if (dodges > 0) return Mood.Nervous;
  return Mood.Idle;
}

const BODY: Record<Mood, string> = {
  [Mood.Idle]: "float 4s ease-in-out infinite",
  [Mood.Hopeful]: "kitten-lean .5s cubic-bezier(.2,.9,.3,1.3) both",
  [Mood.Nervous]: "kitten-shake .45s ease-in-out both",
  [Mood.Sad]: "kitten-droop .6s ease-out both",
  [Mood.Joy]: "kitten-hop .7s cubic-bezier(.2,.9,.3,1.2) both",
};

const doodle: CSSProperties = { position: "absolute", pointerEvents: "none", zIndex: 3 };

/** A heart that rises from the kitten and fades. */
function RisingHeart({ left, delay, size, color }: { left: string; delay: number; size: number; color: string }) {
  return (
    <span aria-hidden="true" style={{ ...doodle, left, bottom: "45%", fontSize: size, color, animation: `heart-rise 2.2s ease-out ${delay}s infinite` }}>
      ♥
    </span>
  );
}

/**
 * The kitten (or the Creator's own picture) with its reactions: it can't change
 * its face, so it moves, and little drawn things appear round it. `beat`
 * restarts the reaction, e.g. once per dodge of "No".
 */
export function ReactiveKitten({ src, alt, mood, beat = 0, width }: { src: string; alt: string; mood: Mood; beat?: number; width: string }) {
  return (
    <div style={{ position: "relative", width, marginBottom: -18, zIndex: 2 }}>
      {/* sparkles twinkling round it while it waits */}
      {mood === Mood.Idle && (
        <>
          <span aria-hidden="true" style={{ ...doodle, top: "8%", left: "-4%", fontSize: 22, color: "var(--accent)", animation: "twinkle 2.4s ease-in-out infinite" }}>
            ✦
          </span>
          <span aria-hidden="true" style={{ ...doodle, top: "30%", right: "-6%", fontSize: 16, color: "var(--accent-2)", animation: "twinkle 2.4s ease-in-out .8s infinite" }}>
            ✦
          </span>
          <span aria-hidden="true" style={{ ...doodle, bottom: "22%", left: "2%", fontSize: 13, color: "var(--accent)", animation: "twinkle 2.4s ease-in-out 1.6s infinite" }}>
            ♡
          </span>
        </>
      )}

      {(mood === Mood.Hopeful || mood === Mood.Joy) && (
        <>
          <RisingHeart left="18%" delay={0} size={22} color="var(--accent)" />
          <RisingHeart left="70%" delay={0.5} size={18} color="var(--accent-2)" />
          <RisingHeart left="44%" delay={1} size={26} color="var(--accent)" />
          {mood === Mood.Joy && (
            <>
              <RisingHeart left="8%" delay={0.25} size={16} color="var(--accent-2)" />
              <RisingHeart left="84%" delay={0.75} size={20} color="var(--accent)" />
            </>
          )}
        </>
      )}

      {/* a sweat drop by its head */}
      {(mood === Mood.Nervous || mood === Mood.Sad) && (
        <svg key={`drop-${beat}`} aria-hidden="true" width="18" height="26" viewBox="0 0 18 26" style={{ ...doodle, top: "12%", right: "16%", animation: "pop .35s cubic-bezier(.2,.9,.3,1.6) both" }}>
          <path d="M9 2C6 9 3 13 3 17a6 6 0 0 0 12 0c0-4-3-8-6-15z" fill="#bfe3ff" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}

      {/* asking again, in a thought bubble */}
      {mood === Mood.Sad && (
        <span
          aria-hidden="true"
          style={{
            ...doodle,
            top: "2%",
            left: "-10%",
            padding: "6px 12px",
            background: "#fff",
            border: "2px solid var(--line)",
            borderRadius: 18,
            fontFamily: "var(--hand)",
            fontSize: 17,
            color: "var(--ink)",
            whiteSpace: "nowrap",
            transform: "rotate(-6deg)",
            animation: "pop .4s cubic-bezier(.2,.9,.3,1.6) both",
          }}
        >
          pretty please? 🥺
        </span>
      )}

      <div key={mood === Mood.Nervous ? `nervous-${beat}` : mood} style={{ animation: BODY[mood], transformOrigin: "50% 100%" }}>
        <Image
          src={src}
          unoptimized={!isOptimizable(src)}
          alt={alt}
          width={300}
          height={300}
          style={{ width: "100%", height: "auto", display: "block", filter: mood === Mood.Sad ? "contrast(1.04) saturate(.8)" : "contrast(1.04)", transition: "filter .4s" }}
          priority
        />
      </div>
    </div>
  );
}

/** A small paw print, left where "No" was before it ran. */
export function PawPrint({ left, top, rotate }: { left: number; top: number; rotate: number }) {
  return (
    <svg
      aria-hidden="true"
      width="26"
      height="26"
      viewBox="0 0 26 26"
      style={{ position: "fixed", left, top, zIndex: 19, pointerEvents: "none", rotate: `${rotate}deg`, animation: "paw-fade 1.6s ease-out forwards" }}
    >
      <g fill="var(--accent)" opacity=".55">
        <ellipse cx="13" cy="17" rx="6" ry="5" />
        <circle cx="6" cy="10" r="2.4" />
        <circle cx="10.5" cy="6" r="2.4" />
        <circle cx="15.5" cy="6" r="2.4" />
        <circle cx="20" cy="10" r="2.4" />
      </g>
    </svg>
  );
}
