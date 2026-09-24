"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { isOptimizable } from "@/lib/media";

/** Fine paper grain, drawn as an SVG noise tile so no image has to load. */
export const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .36  0 0 0 0 .31  0 0 0 0 .24  0 0 0 .1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export const FIBRES =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.02 .09' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .43  0 0 0 0 .33  0 0 0 .07 0'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>\")";

/** SVG filters shared by the paper and the ink; render once. */
export function PaperFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <filter id="ll-deckle" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="4" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="7" />
      </filter>
      <filter id="ll-ink">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="2" />
        <feDisplacementMap in="SourceGraphic" scale="1.4" />
      </filter>
      <filter id="ll-wash" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" seed="9" />
        <feDisplacementMap in="SourceGraphic" scale="6" />
      </filter>
    </svg>
  );
}

const inkStroke = {
  fill: "none",
  stroke: "var(--ll-ink)",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type DoodleProps = { size?: number; style?: CSSProperties };

export function Sun({ size = 64, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" style={style}>
      <ellipse cx="32" cy="33" rx="10" ry="11" fill="var(--ll-sun)" opacity=".9" filter="url(#ll-wash)" />
      <g {...inkStroke} strokeWidth={1.3} stroke="var(--ll-graphite)" filter="url(#ll-ink)">
        <path d="M32 6v9M32 51v8M6 33h9M50 33h8M13 13l6 6M45 46l6 6M13 53l6-6M46 19l5-5" />
      </g>
    </svg>
  );
}

export function Star({ size = 22, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={style}>
      <path
        d="M12 2.5l2.6 6.1 6.6.5-5 4.3 1.6 6.5L12 16.4l-5.8 3.5 1.6-6.5-5-4.3 6.6-.5z"
        {...inkStroke}
        fill="var(--ll-sky)"
        strokeWidth={1.3}
        filter="url(#ll-ink)"
      />
    </svg>
  );
}

export function Leaf({ size = 26, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 30 30" width={size} height={size} aria-hidden="true" style={style}>
      <path d="M5 25C5 12 13 5 26 4c0 13-8 21-21 21z" fill="var(--ll-leaf)" opacity=".85" filter="url(#ll-wash)" />
      <path d="M6 24C12 17 17 12 24 6" {...inkStroke} strokeWidth={1.2} filter="url(#ll-ink)" />
    </svg>
  );
}

export function FlowerRow({ width = 170, style }: { width?: number; style?: CSSProperties }) {
  const heads = ["var(--ll-sky)", "var(--ll-petal)", "var(--ll-sun)", "var(--ll-petal)", "var(--ll-sky)"];
  return (
    <svg viewBox="0 0 170 40" width={width} aria-hidden="true" style={style}>
      <path d="M4 38c30-2 130-2 162 0" {...inkStroke} strokeWidth={1.1} stroke="var(--ll-graphite)" filter="url(#ll-ink)" />
      {heads.map((color, i) => {
        const x = 20 + i * 32;
        const top = 10 + (i % 2) * 5;
        return (
          <g key={i}>
            <path d={`M${x} 37C${x - 1} 30 ${x + 1} 22 ${x} ${top + 5}`} {...inkStroke} strokeWidth={1.1} stroke="var(--ll-leaf-ink)" />
            <path d={`M${x} 30c-4-1-6-3-7-6 3 0 6 2 7 6z`} fill="var(--ll-leaf)" />
            <circle cx={x} cy={top} r="5.5" fill={color} opacity=".9" filter="url(#ll-wash)" />
            <circle cx={x} cy={top} r="5.5" {...inkStroke} strokeWidth={1} filter="url(#ll-ink)" />
            <circle cx={x} cy={top} r="1.3" fill="var(--ll-ink)" />
          </g>
        );
      })}
    </svg>
  );
}

export function PaperPlane({ size = 90, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 70" width={size} height={size * 0.7} aria-hidden="true" style={style}>
      <path d="M4 38 96 6 58 64 44 44z" fill="var(--ll-card)" />
      <path d="M44 44 96 6 36 50z" fill="var(--ll-paper-deep)" />
      <g {...inkStroke} strokeWidth={1.4} filter="url(#ll-ink)">
        <path d="M4 38 96 6 58 64 44 44z" />
        <path d="M44 44 96 6M44 44l-8 6 2-10" />
      </g>
    </svg>
  );
}

export function Arrow({ width = 54, style }: { width?: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 30" width={width} aria-hidden="true" style={{ overflow: "visible", ...style }}>
      <g {...inkStroke} strokeWidth={1.4} filter="url(#ll-ink)">
        <path d="M3 24C18 6 36 4 54 12" />
        <path d="M46 5l8 7-10 3" />
      </g>
    </svg>
  );
}

/** An ink loop around whatever it sits in, drawn on as it appears. Parent must be `position: relative`. */
export function InkCircle({ draw = true, pad = 10 }: { draw?: boolean; pad?: number }) {
  return (
    <svg
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{
        position: "absolute",
        left: -(pad * 2 + 6),
        top: -pad,
        width: `calc(100% + ${pad * 4 + 12}px)`,
        height: `calc(100% + ${pad * 2}px)`,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <path
        d="M30 9C80-2 162 1 190 19c16 12-6 33-72 37C58 60 7 50 6 30 5 17 26 8 64 5"
        fill="none"
        stroke="var(--ll-ink)"
        strokeWidth="1.9"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        style={draw ? { strokeDasharray: 1, strokeDashoffset: 1, animation: "ll-draw .5s ease-out forwards" } : undefined}
      />
    </svg>
  );
}

export function Photo({
  src,
  alt,
  width,
  tilt = 0,
  tape = true,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  width: string;
  tilt?: number;
  tape?: boolean;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width,
        padding: 6,
        background: "#fffdf9",
        boxShadow: "0 1px 2px rgba(60,50,35,.12), 0 12px 22px -14px rgba(60,50,35,.5)",
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden" }}>
        <Image src={src} unoptimized={!isOptimizable(src)} alt={alt} fill sizes={sizes} priority={priority ?? false} style={{ objectFit: "cover" }} />
      </div>
      <span aria-hidden="true" style={{ position: "absolute", left: -7, top: -7, fontFamily: "var(--ll-print)", fontSize: 13, color: "var(--ll-graphite)", lineHeight: 1 }}>
        +
      </span>
      {tape && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -9,
            left: "50%",
            width: 58,
            height: 18,
            transform: "translateX(-50%) rotate(-3deg)",
            background: "rgba(236,226,205,.72)",
            boxShadow: "0 1px 1px rgba(60,50,35,.08)",
          }}
        />
      )}
    </div>
  );
}
