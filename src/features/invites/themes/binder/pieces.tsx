// Binder's scrapbook pieces, drawn in CSS and inline SVG (no decoration images;
// see #153): grid paper, washi tape, polaroids, rings, a paper clip, typed cards,
// a script card, a label strip, marker words and stickers. No red anywhere.
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { isOptimizable } from "@/lib/media";
import { GRAIN } from "../envelope/ornaments";

export const COLORS = {
  board: "#cfc8c0",
  paper: "#fdfcf8",
  ink: "#2b2622",
  soft: "#7d726a",
  /** Handwritten highlights */
  brown: "#8a6240",
  kraft: "#a97b52",
  sage: "#8fae7e",
  /** Yes and the picked time: a deeper shade of the sage card */
  accent: "#5f7d52",
  dot: "#f0a050",
} as const;

export const FONT = {
  marker: "var(--font-marker), var(--font-architects-daughter), cursive",
  hand: "var(--font-caveat), cursive",
  note: "var(--font-architects-daughter), cursive",
  typed: "var(--font-courier-prime), ui-monospace, monospace",
} as const;

export const BOARD_BG = `${GRAIN}, ${COLORS.board}`;

export const GRID_BG = [
  "linear-gradient(rgba(70,90,120,.09) 1px, transparent 1px) 0 0 / 15px 15px",
  "linear-gradient(90deg, rgba(70,90,120,.09) 1px, transparent 1px) 0 0 / 15px 15px",
  COLORS.paper,
].join(", ");

const TAPES = {
  beige: "rgba(226,210,180,.78)",
  sage: "rgba(160,190,150,.75)",
  pink: "rgba(240,205,200,.75)",
  grid: "rgba(235,235,230,.8)",
};
export type TapeTone = keyof typeof TAPES;

const ZIGZAG = "polygon(3% 0, 97% 0, 100% 20%, 97% 40%, 100% 60%, 97% 80%, 100% 100%, 3% 100%, 0 80%, 3% 60%, 0 40%, 3% 20%)";

/** Washi tape: a see-through strip with zig-zag ends. */
export function Tape({ style, tone = "beige", width = 70 }: { style?: CSSProperties; tone?: TapeTone; width?: number }) {
  const pattern =
    tone === "grid"
      ? "repeating-linear-gradient(90deg, rgba(0,0,0,.07) 0 1px, transparent 1px 6px), repeating-linear-gradient(0deg, rgba(0,0,0,.07) 0 1px, transparent 1px 6px)"
      : "repeating-linear-gradient(90deg, rgba(255,255,255,.28) 0 5px, transparent 5px 11px)";
  return (
    <span
      aria-hidden="true"
      style={{ position: "absolute", width, height: 20, background: `${pattern}, ${TAPES[tone]}`, clipPath: ZIGZAG, zIndex: 3, ...style }}
    />
  );
}

/** A taped polaroid with a handwritten caption. Creators' photos can be any https link. */
export function Polaroid({
  src,
  alt,
  caption,
  width,
  rotate = 0,
  tape = "beige",
  style,
}: {
  src: string;
  alt: string;
  caption?: string | undefined;
  width: number;
  rotate?: number;
  tape?: TapeTone | false;
  style?: CSSProperties;
}) {
  const tapeWidth = Math.round(width * 0.45);
  return (
    <figure
      style={{
        position: "relative",
        width,
        margin: 0,
        padding: "8px 8px 0",
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.12), 0 6px 14px rgba(0,0,0,.12)",
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {tape && <Tape tone={tape} width={tapeWidth} style={{ top: -9, left: "50%", marginLeft: -tapeWidth / 2, transform: `rotate(${-rotate * 1.5 - 3}deg)` }} />}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", background: "#eee", overflow: "hidden" }}>
        <Image src={src} unoptimized={!isOptimizable(src)} alt={alt} fill sizes={`${width}px`} draggable={false} style={{ objectFit: "cover" }} />
      </div>
      <figcaption style={{ fontFamily: FONT.hand, fontSize: 17, color: COLORS.ink, textAlign: "center", padding: "4px 2px 6px", minHeight: 26 }}>
        {caption}
      </figcaption>
    </figure>
  );
}

function Ring() {
  return (
    <svg width="16" height="34" viewBox="0 0 16 34" aria-hidden="true">
      <defs>
        <linearGradient id="binder-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f4f4f4" />
          <stop offset=".45" stopColor="#a9a9a9" />
          <stop offset=".55" stopColor="#d9d9d9" />
          <stop offset="1" stopColor="#7d7d7d" />
        </linearGradient>
      </defs>
      <rect x="3" y="1" width="10" height="32" rx="5" fill="none" stroke="url(#binder-metal)" strokeWidth="3.5" />
    </svg>
  );
}

/** Six rings along the top edge, in two groups of three like a real binder. */
export function Rings() {
  const group = (
    <div style={{ display: "flex", gap: 18 }}>
      <Ring />
      <Ring />
      <Ring />
    </div>
  );
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "12%", right: "12%", top: -9, display: "flex", justifyContent: "space-between", zIndex: 4 }}>
      {group}
      {group}
    </div>
  );
}

/** A grid-paper page with punched holes along the top, lined up under the Rings. */
export function Sheet({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const holes = (
    <div style={{ display: "flex", gap: 25, padding: "0 3.5px" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 9, height: 9, borderRadius: 9, background: COLORS.board, boxShadow: "inset 0 1px 2px rgba(0,0,0,.35)" }} />
      ))}
    </div>
  );
  return (
    <div style={{ position: "relative", background: GRID_BG, boxShadow: "0 2px 6px rgba(0,0,0,.15)", ...style }}>
      <div aria-hidden="true" style={{ position: "absolute", left: "12%", right: "12%", top: 8, display: "flex", justifyContent: "space-between" }}>
        {holes}
        {holes}
      </div>
      {children}
    </div>
  );
}

/** A printed card with typewriter text, kraft or cream. */
export function TypedCard({ children, tone = "kraft", rotate = 0, style }: { children: ReactNode; tone?: "kraft" | "cream"; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: "relative",
        padding: "12px 14px",
        background: tone === "kraft" ? COLORS.kraft : "#f6efe2",
        color: tone === "kraft" ? "#fbf3e6" : COLORS.ink,
        fontFamily: FONT.typed,
        fontSize: 12.5,
        lineHeight: 1.5,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 2px 5px rgba(0,0,0,.15)",
        overflowWrap: "anywhere",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A sage paper card with a big script line and an orange dot sticker. */
export function ScriptCard({ children, rotate = 0, style }: { children: ReactNode; rotate?: number; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", padding: "26px 14px 22px", background: COLORS.sage, transform: `rotate(${rotate}deg)`, boxShadow: "0 2px 5px rgba(0,0,0,.12)", ...style }}>
      <span aria-hidden="true" style={{ position: "absolute", top: -8, left: 18, width: 30, height: 20, borderRadius: "50%", background: COLORS.dot, transform: "rotate(-12deg)" }} />
      <div style={{ fontFamily: FONT.hand, fontSize: 40, lineHeight: 0.95, color: "#fffdf6", transform: "rotate(-6deg)", overflowWrap: "anywhere" }}>{children}</div>
    </div>
  );
}

/** A black label-maker strip with small typed text. */
export function LabelStrip({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ display: "inline-block", padding: "3px 8px", background: "#1d1b19", color: "#f4f1ea", fontFamily: FONT.typed, fontSize: 11, letterSpacing: 0.5, ...style }}>
      {children}
    </span>
  );
}

/** A silver paper clip. */
export function PaperClip({ style }: { style?: CSSProperties }) {
  return (
    <svg width="18" height="44" viewBox="0 0 18 44" aria-hidden="true" style={{ position: "absolute", zIndex: 4, ...style }}>
      <path d="M5 12V34a4 4 0 0 0 8 0V8a6 6 0 0 0-12 0v28a8 8 0 0 0 16 0V14" fill="none" stroke="#a9a9a9" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Marker words stuck on the page, like "busy doing nothing". */
export function MarkerWords({ children, rotate = -4, style }: { children: ReactNode; rotate?: number; style?: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      style={{ position: "absolute", fontFamily: FONT.marker, fontSize: 17, lineHeight: 1.05, color: COLORS.ink, textTransform: "uppercase", transform: `rotate(${rotate}deg)`, zIndex: 3, ...style }}
    >
      {children}
    </span>
  );
}

/** A hand-drawn sticker. */
export function Sticker({ kind, size = 34, style }: { kind: "star" | "heart" | "sun"; size?: number; style?: CSSProperties }) {
  const line = { stroke: COLORS.ink, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ position: "absolute", zIndex: 3, ...style }}>
      {kind === "star" && <path d="M20 4l4.6 10 10.9 1.2-8.2 7.4 2.4 10.8L20 27.9 10.3 33.4l2.4-10.8-8.2-7.4L15.4 14z" fill="#f4c64e" {...line} />}
      {kind === "heart" && <path d="M20 34S5 25 5 15a7.5 7.5 0 0 1 15-1.5A7.5 7.5 0 0 1 35 15c0 10-15 19-15 19z" fill="#f3b8a2" {...line} />}
      {kind === "sun" && (
        <g {...line}>
          <circle cx="20" cy="20" r="8" fill={COLORS.dot} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="20" y1="5" x2="20" y2="9" transform={`rotate(${a} 20 20)`} />
          ))}
        </g>
      )}
    </svg>
  );
}
