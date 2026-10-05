// Binder's scrapbook pieces, drawn in CSS and inline SVG (no decoration images;
// see #153): the binder itself (cloth cover, grid paper, rings through punched
// holes, a chipboard back board, divider tabs), washi tape, polaroids, a paper
// clip, typed cards, a script card, a label strip, marker words and stickers.
// No red anywhere.
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { isOptimizable } from "@/lib/media";
import type { EnumValue } from "@/lib/enums";
import { GRAIN } from "../shared/paper";
import { COLORS } from "./palette";

export const FONT = {
  marker: "var(--font-marker), var(--font-architects-daughter), cursive",
  hand: "var(--font-caveat), cursive",
  note: "var(--font-architects-daughter), cursive",
  typed: "var(--font-courier-prime), ui-monospace, monospace",
} as const;

/** The desk the binder lies on, lit from the top left. */
export const BOARD_BG = `${GRAIN}, radial-gradient(120% 70% at 30% 0%, rgba(255,250,240,.55), transparent 65%), radial-gradient(90% 60% at 50% 110%, rgba(60,40,20,.18), transparent 70%), ${COLORS.board}`;

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

/**
 * Where the rings sit: two groups of three along the top. The holes in every
 * sheet use the same layout so each ring goes through its hole.
 */
const RING = { width: 24, gap: 9, x: 7, loop: 10, edge: 28, hole: 13 } as const;

function RingRow({ top, slot }: { top: number; slot: (i: number) => ReactNode }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "12%", right: "12%", top, display: "flex", justifyContent: "space-between", pointerEvents: "none" }}>
      {[0, 3].map((g) => (
        <div key={g} style={{ display: "flex", gap: RING.gap }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ position: "relative", display: "block", width: RING.width }}>
              {slot(g + i)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** One ring, side on: it loops over the top edge and its front wire goes down into the hole. */
function Ring() {
  const { x, loop, edge, hole } = RING;
  const end = edge + hole;
  const r = loop / 2;
  return (
    <svg width={RING.width} height={end + 4} viewBox={`0 0 ${RING.width} ${end + 4}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="binder-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#858585" />
          <stop offset=".3" stopColor="#fafafa" />
          <stop offset=".55" stopColor="#bdbdbd" />
          <stop offset="1" stopColor="#6a6a6a" />
        </linearGradient>
      </defs>
      {/* its shadow on the paper */}
      <path d={`M${x + 2.5} ${edge + 1} V${end + 1.5}`} stroke="rgba(0,0,0,.22)" strokeWidth="4" strokeLinecap="round" style={{ filter: "blur(1px)" }} />
      {/* the back wire, behind the sheet, so only above the edge */}
      <path d={`M${x + loop} ${edge} V${r + 3}`} stroke="#777" strokeWidth="3.6" />
      <path d={`M${x} ${end} V${r + 3} A${r} ${r} 0 0 1 ${x + loop} ${r + 3}`} fill="none" stroke="url(#binder-metal)" strokeWidth="4" />
      <path d={`M${x - 0.8} ${end - 2} V${r + 3}`} stroke="rgba(255,255,255,.8)" strokeWidth=".9" />
    </svg>
  );
}

/** Six metal rings along the top edge, in two groups of three like a real binder. */
export function Rings() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none" }}>
      <RingRow top={-RING.edge} slot={(i) => <Ring key={i} />} />
    </div>
  );
}

/** What a sheet is made of: the hard cloth cover, or a page of grid paper. */
export const SheetKind = { Board: "board", Paper: "paper" } as const;
export type SheetKind = EnumValue<typeof SheetKind>;

const PAPER_BG = `${GRAIN}, linear-gradient(165deg, rgba(255,255,255,.55), transparent 35%, rgba(60,40,20,.035)), ${GRID_BG}`;
const CLOTH_BG = [
  GRAIN,
  "repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 3px)",
  "repeating-linear-gradient(90deg, rgba(0,0,0,.06) 0 1px, transparent 1px 3px)",
  "radial-gradient(130% 90% at 25% 10%, rgba(255,255,255,.16), transparent 60%)",
  COLORS.cloth,
].join(", ");

const FACE: Record<SheetKind, CSSProperties> = {
  [SheetKind.Paper]: { background: PAPER_BG, borderRadius: 2, boxShadow: "0 1px 2px rgba(0,0,0,.12)" },
  [SheetKind.Board]: {
    background: CLOTH_BG,
    borderRadius: "3px 3px 9px 9px",
    boxShadow: `inset 0 0 0 1px rgba(255,255,255,.1), inset 0 -4px 0 ${COLORS.clothEdge}, inset 0 1px 0 rgba(255,255,255,.25), 0 2px 4px rgba(0,0,0,.25)`,
  },
};

/** Punched holes; the cover's have metal eyelets. */
function Holes({ kind }: { kind: SheetKind }) {
  const board = kind === SheetKind.Board;
  return (
    <RingRow
      top={RING.hole - 4.5}
      slot={() => (
        <span
          style={{
            position: "absolute",
            left: RING.x - 4.5,
            width: 9,
            height: 9,
            borderRadius: 9,
            background: "#e6e0d4",
            boxShadow: board ? "0 0 0 2.5px #c8c8c4, 0 0 0 3.5px rgba(0,0,0,.25), inset 0 1px 2px rgba(0,0,0,.4)" : "inset 0 1px 2px rgba(0,0,0,.35)",
          }}
        />
      )}
    />
  );
}

/** The front of a sheet: its paper or cloth, the punched holes, and what's on it. */
export function Sheet({ kind = SheetKind.Paper, children, style }: { kind?: SheetKind; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", ...FACE[kind], ...style }}>
      <Holes kind={kind} />
      {children}
    </div>
  );
}

/** The back of a sheet, seen as it turns over the rings: plain paper, or the cover's chipboard lining. */
export function SheetBack({ kind, children, style }: { kind: SheetKind; children?: ReactNode; style?: CSSProperties }) {
  const board = kind === SheetKind.Board;
  return (
    <div
      style={{
        position: "relative",
        background: board ? `${GRAIN}, ${COLORS.chip}` : `${GRAIN}, linear-gradient(rgba(0,0,0,.035), rgba(0,0,0,.035)), ${GRID_BG}`,
        borderRadius: board ? "9px 9px 3px 3px" : 2,
        ...style,
      }}
    >
      <Holes kind={kind} />
      {children}
    </div>
  );
}

/** The chipboard back board under the pages, with the binder's shadow on the desk. */
export function BackBoard() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: "0 -5px -12px",
        borderRadius: "4px 4px 10px 10px",
        background: `${GRAIN}, linear-gradient(rgba(0,0,0,.06), transparent 30%), ${COLORS.chip}`,
        boxShadow: "0 22px 40px -12px rgba(40,25,10,.45), 0 4px 10px rgba(40,25,10,.2), inset 0 -3px 0 rgba(0,0,0,.15)",
      }}
    />
  );
}

const TAB_TONES = ["#f3ead8", "#cfe0c4", "#e9d3b3", "#d7e1e6", "#f5dcc4"];

/** A divider tab along the bottom edge, in the page's place among the others. */
export function Tab({ label, name, slot, of, onClick }: { label: string; name: string; slot: number; of: number; onClick?: () => void }) {
  const style: CSSProperties = {
    position: "absolute",
    bottom: -26,
    left: `calc(10px + (100% - 20px) * ${slot} / ${of})`,
    width: `calc((100% - 20px) / ${of} - 5px)`,
    height: 34,
    padding: "12px 2px 0",
    border: 0,
    borderRadius: "0 0 8px 8px",
    background: `${GRAIN}, ${TAB_TONES[slot % TAB_TONES.length]}`,
    boxShadow: "0 2px 3px rgba(0,0,0,.18), inset 0 -1px 0 rgba(0,0,0,.08)",
    fontFamily: FONT.typed,
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.ink,
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    cursor: onClick ? "pointer" : "default",
  };
  return onClick ? (
    <button type="button" aria-label={`Go to ${name}`} onClick={onClick} style={style}>
      {label}
    </button>
  ) : (
    <span aria-hidden="true" style={style}>
      {label}
    </span>
  );
}

/** A printed card with typewriter text, kraft or cream. */
export const CardTone = { Kraft: "kraft", Cream: "cream" } as const;
export type CardTone = EnumValue<typeof CardTone>;

export function TypedCard({ children, tone = CardTone.Kraft, rotate = 0, style }: { children: ReactNode; tone?: CardTone; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: "relative",
        padding: "12px 14px",
        background: tone === CardTone.Kraft ? COLORS.kraft : "#f6efe2",
        color: tone === CardTone.Kraft ? "#fbf3e6" : COLORS.ink,
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

export const StickerKind = { Star: "star", Heart: "heart", Sun: "sun" } as const;
export type StickerKind = EnumValue<typeof StickerKind>;

/** A hand-drawn sticker. */
export function Sticker({ kind, size = 34, style }: { kind: StickerKind; size?: number; style?: CSSProperties }) {
  const line = { stroke: COLORS.ink, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ position: "absolute", zIndex: 3, ...style }}>
      {kind === StickerKind.Star && <path d="M20 4l4.6 10 10.9 1.2-8.2 7.4 2.4 10.8L20 27.9 10.3 33.4l2.4-10.8-8.2-7.4L15.4 14z" fill="#f4c64e" {...line} />}
      {kind === StickerKind.Heart && <path d="M20 34S5 25 5 15a7.5 7.5 0 0 1 15-1.5A7.5 7.5 0 0 1 35 15c0 10-15 19-15 19z" fill="#f3b8a2" {...line} />}
      {kind === StickerKind.Sun && (
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
