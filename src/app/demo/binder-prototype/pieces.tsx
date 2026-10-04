// PROTOTYPE: scrapbook pieces drawn in CSS + inline SVG, as research #153 recommends.
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { GRAIN } from "@/features/invites/themes/envelope/ornaments";

export const C = {
  board: "#cfc8c0",
  paper: "#fdfcf8",
  ink: "#2b2622",
  soft: "#7d726a",
  olive: "#5f6b3c",
  rust: "#c4572e",
  elastic: "#d8392b",
  kraft: "#b08a5f",
  sage: "#93ae84",
};

export const FONT = {
  display: "var(--font-bagel), var(--font-caveat), cursive",
  marker: "var(--font-marker), var(--font-architects-daughter), cursive",
  hand: "var(--font-caveat), cursive",
  note: "var(--font-architects-daughter), cursive",
};

export const BOARD_BG = `${GRAIN}, ${C.board}`;

export const GRID_BG = [
  "linear-gradient(rgba(70,90,120,.09) 1px, transparent 1px) 0 0 / 15px 15px",
  "linear-gradient(90deg, rgba(70,90,120,.09) 1px, transparent 1px) 0 0 / 15px 15px",
  C.paper,
].join(", ");

const TAPES = {
  beige: "rgba(226,210,180,.78)",
  sage: "rgba(160,190,150,.75)",
  pink: "rgba(240,190,195,.75)",
  grid: "rgba(235,235,230,.8)",
};

const ZIGZAG = "polygon(3% 0, 97% 0, 100% 20%, 97% 40%, 100% 60%, 97% 80%, 100% 100%, 3% 100%, 0 80%, 3% 60%, 0 40%, 3% 20%)";

/** Washi tape: a see-through strip with zig-zag ends. */
export function Tape({ style, tone = "beige", width = 70 }: { style?: CSSProperties; tone?: keyof typeof TAPES; width?: number }) {
  const pattern =
    tone === "grid"
      ? "repeating-linear-gradient(90deg, rgba(0,0,0,.07) 0 1px, transparent 1px 6px), repeating-linear-gradient(0deg, rgba(0,0,0,.07) 0 1px, transparent 1px 6px)"
      : "repeating-linear-gradient(90deg, rgba(255,255,255,.28) 0 5px, transparent 5px 11px)";
  return (
    <span
      aria-hidden
      style={{ position: "absolute", width, height: 20, background: `${pattern}, ${TAPES[tone]}`, clipPath: ZIGZAG, zIndex: 3, ...style }}
    />
  );
}

/** A taped polaroid with a handwritten caption. */
export function Polaroid({
  src,
  caption,
  width = 150,
  rotate = 0,
  style,
  tape = "beige",
}: {
  src: string;
  caption?: string;
  width?: number;
  rotate?: number;
  style?: CSSProperties;
  tape?: keyof typeof TAPES | false;
}) {
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
      {tape ? <Tape tone={tape} width={width * 0.45} style={{ top: -9, left: "50%", marginLeft: -(width * 0.45) / 2, transform: `rotate(${-rotate * 1.5 - 3}deg)` }} /> : null}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", background: "#eee", overflow: "hidden" }}>
        <Image src={src} alt="" fill sizes={`${width}px`} style={{ objectFit: "cover" }} />
      </div>
      <figcaption style={{ fontFamily: FONT.hand, fontSize: 17, color: C.ink, textAlign: "center", padding: "4px 0 6px", minHeight: 26 }}>
        {caption}
      </figcaption>
    </figure>
  );
}

/** One metal ring of the binder. */
function Ring({ horizontal }: { horizontal: boolean }) {
  return (
    <svg width={horizontal ? 16 : 34} height={horizontal ? 34 : 16} viewBox="0 0 34 16" aria-hidden style={horizontal ? { transform: "rotate(90deg)" } : undefined}>
      <defs>
        <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f4f4" />
          <stop offset=".45" stopColor="#a9a9a9" />
          <stop offset=".55" stopColor="#d9d9d9" />
          <stop offset="1" stopColor="#7d7d7d" />
        </linearGradient>
      </defs>
      <rect x="1" y="3" width="32" height="10" rx="5" fill="none" stroke="url(#metal)" strokeWidth="3.5" />
    </svg>
  );
}

/** Six rings, in two groups of three like a real binder. */
export function Rings({ horizontal = false, style }: { horizontal?: boolean; style?: CSSProperties }) {
  const group = (
    <div style={{ display: "flex", flexDirection: horizontal ? "row" : "column", gap: horizontal ? 18 : 22 }}>
      <Ring horizontal={horizontal} />
      <Ring horizontal={horizontal} />
      <Ring horizontal={horizontal} />
    </div>
  );
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        justifyContent: "space-between",
        zIndex: 4,
        ...(horizontal ? { left: "12%", right: "12%", top: -9 } : { top: "9%", bottom: "9%", left: -14 }),
        ...style,
      }}
    >
      {group}
      {group}
    </div>
  );
}

/** The red elastic band that keeps the binder closed. */
export function Elastic({ style }: { style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: -4,
        bottom: -4,
        width: 7,
        borderRadius: 4,
        background: `linear-gradient(90deg, #a8251b, ${C.elastic} 40%, #ff7a68 55%, ${C.elastic} 70%, #a8251b)`,
        boxShadow: "1px 0 3px rgba(0,0,0,.3)",
        zIndex: 5,
        ...style,
      }}
    />
  );
}

/** A hand-drawn sticker. */
export function Sticker({ kind, size = 34, style }: { kind: "star" | "heart" | "sun"; size?: number; style?: CSSProperties }) {
  const common = { stroke: C.ink, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden style={{ position: "absolute", zIndex: 3, ...style }}>
      {kind === "star" && <path d="M20 4l4.6 10 10.9 1.2-8.2 7.4 2.4 10.8L20 27.9 10.3 33.4l2.4-10.8-8.2-7.4L15.4 14z" fill="#f4c64e" {...common} />}
      {kind === "heart" && <path d="M20 34S5 25 5 15a7.5 7.5 0 0 1 15-1.5A7.5 7.5 0 0 1 35 15c0 10-15 19-15 19z" fill="#ef8f9f" {...common} />}
      {kind === "sun" && (
        <g {...common}>
          <circle cx="20" cy="20" r="8" fill="#f6a24a" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="20" y1="5" x2="20" y2="9" transform={`rotate(${a} 20 20)`} />
          ))}
        </g>
      )}
    </svg>
  );
}

/** A grid-paper page with punched holes along one edge, lined up under the Rings. */
export function Page({ children, holes = "left", style }: { children: ReactNode; holes?: "left" | "top"; style?: CSSProperties }) {
  const left = holes === "left";
  const hole = (i: number) => (
    <span key={i} style={{ width: 9, height: 9, borderRadius: 9, background: C.board, boxShadow: "inset 0 1px 2px rgba(0,0,0,.35)" }} />
  );
  // Same pitch as Rings: a ring is 16px across with a 22px (vertical) or 18px (horizontal) gap.
  const group = (offset: number) => (
    <div style={{ display: "flex", flexDirection: left ? "column" : "row", gap: left ? 29 : 25, padding: left ? "3.5px 0" : "0 3.5px" }}>
      {[0, 1, 2].map((i) => hole(offset + i))}
    </div>
  );
  return (
    <div style={{ position: "relative", background: GRID_BG, boxShadow: "0 2px 6px rgba(0,0,0,.15)", ...style }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "space-between",
          ...(left ? { flexDirection: "column", top: "9%", bottom: "9%", left: 8 } : { left: "12%", right: "12%", top: 8 }),
        }}
      >
        {group(0)}
        {group(3)}
      </div>
      {children}
    </div>
  );
}

/** A kraft-paper tag for a Stop's time label. */
export function TimeTag({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 12px 3px 16px",
        background: C.kraft,
        color: "#fff",
        fontFamily: FONT.marker,
        fontSize: 13,
        clipPath: "polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** A button that looks like a label stuck on the page. */
export function LabelButton({ children, onClick, tone = "ink" }: { children: ReactNode; onClick: () => void; tone?: "ink" | "red" | "plain" }) {
  const bg = tone === "red" ? C.elastic : tone === "ink" ? C.ink : "transparent";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: FONT.marker,
        fontSize: tone === "plain" ? 15 : 19,
        color: tone === "plain" ? C.soft : "#fff",
        background: bg,
        border: 0,
        padding: tone === "plain" ? "6px 8px" : "10px 22px",
        transform: tone === "plain" ? undefined : "rotate(-1.5deg)",
        boxShadow: tone === "plain" ? undefined : "0 3px 0 rgba(0,0,0,.18)",
        textDecoration: tone === "plain" ? "underline wavy" : undefined,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
