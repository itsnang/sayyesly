// Binder's scrapbook pieces, drawn in CSS and inline SVG (no decoration images;
// see #153). The notebook itself: cream pages and a chipboard cover on a silver
// spiral down the left edge. And what's stuck on its pages: ransom-note letters,
// tape, polaroids, a film strip, a postage stamp, a binder clip, a kraft note, a
// torn lined scrap, a guest check, tickets, a street sign, sticky notes, a ribbon
// bow, dots, doodles and stickers. No red anywhere.
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
  serif: "var(--font-ransom), Georgia, 'Times New Roman', serif",
  sign: "'Helvetica Neue', Arial, sans-serif",
} as const;

/** The desk the notebook lies on, lit from the top left. */
export const BOARD_BG = `${GRAIN}, radial-gradient(120% 70% at 30% 0%, rgba(255,250,240,.6), transparent 65%), radial-gradient(90% 60% at 50% 110%, rgba(60,40,20,.16), transparent 70%), ${COLORS.board}`;

/* ------------------------------------------------------------------ the notebook */

/**
 * The spiral: one coil every `period` px down the left edge, from `inset` below
 * the top to `inset` above the bottom. Each goes from its hole (`hole` px in from
 * the edge) round the wire's axis, `hinge` px left of the edge, which is where a
 * page turns; it reaches `reach` px past the edge.
 */
const COIL = { period: 22, inset: 16, hole: 10, reach: 26, hinge: 6 } as const;
export const HINGE = COIL.hinge;
export const COIL_REACH = COIL.reach;

const svg = (body: string, w: number, h: number) => `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${body}</svg>")`;
// The strip starts `reach` px left of the page edge: its own x 26 is the edge, 36 the hole.
const COIL_BG = svg(
  "<defs><linearGradient id='m' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='%23fafafa'/><stop offset='.45' stop-color='%23b9b9b9'/><stop offset='1' stop-color='%235f5f5f'/></linearGradient></defs>" +
    "<path d='M36 15.5C28 20 11 20 6 15' fill='none' stroke='rgba(0,0,0,.2)' stroke-width='2.4'/>" +
    "<path d='M4 12C9 5 20 5 26 7' fill='none' stroke='%23727272' stroke-width='3'/>" +
    "<path d='M36 13C28 18 10 18 4 12' fill='none' stroke='url(%23m)' stroke-width='3.6' stroke-linecap='round'/>",
  42,
  COIL.period,
);
const HOLE_BG = `radial-gradient(circle at ${COIL.hole}px 13px, #3a332c 0 2.8px, rgba(0,0,0,.16) 3.4px, transparent 4px)`;
// `space` spreads the leftover length evenly, the same for the coils and every sheet's holes.
const coilStrip: CSSProperties = { position: "absolute", top: COIL.inset, bottom: COIL.inset, backgroundRepeat: "no-repeat space", pointerEvents: "none" };

/** The silver spiral down the left edge, over every sheet. */
export function Spiral() {
  return <div aria-hidden="true" style={{ ...coilStrip, left: -COIL.reach, width: 42, zIndex: 6, backgroundImage: COIL_BG, backgroundSize: `42px ${COIL.period}px` }} />;
}

/** A sheet's punched holes: down its left edge, or on its back down the right. */
function Holes({ side }: { side: "left" | "right" }) {
  return <div aria-hidden="true" style={{ ...coilStrip, [side]: 0, width: 20, backgroundImage: HOLE_BG, backgroundSize: `20px ${COIL.period}px` }} />;
}

/** What a sheet is made of: the chipboard cover, or a page of cream paper. */
export const SheetKind = { Board: "board", Paper: "paper" } as const;
export type SheetKind = EnumValue<typeof SheetKind>;

const PAPER_BG = `${GRAIN}, linear-gradient(90deg, rgba(60,40,20,.07), transparent 7%), ${COLORS.paper}`;
const COVER_BG = [
  GRAIN,
  "radial-gradient(130% 90% at 25% 10%, rgba(255,255,255,.18), transparent 60%)",
  "repeating-linear-gradient(35deg, rgba(90,60,30,.05) 0 1px, transparent 1px 4px)",
  COLORS.cover,
].join(", ");

const FACE: Record<SheetKind, CSSProperties> = {
  [SheetKind.Paper]: { background: PAPER_BG, borderRadius: "2px 9px 9px 2px", boxShadow: "0 1px 2px rgba(0,0,0,.14)" },
  [SheetKind.Board]: {
    background: COVER_BG,
    borderRadius: "3px 12px 12px 3px",
    boxShadow: `inset 0 0 0 1px rgba(255,255,255,.12), inset -3px -3px 0 ${COLORS.coverEdge}, 0 2px 4px rgba(0,0,0,.25)`,
  },
};
const BACK: Record<SheetKind, string> = {
  // Lined on the back, like a journal's left-hand page.
  [SheetKind.Paper]: `${GRAIN}, linear-gradient(270deg, rgba(60,40,20,.08), transparent 7%), repeating-linear-gradient(transparent 0 25px, rgba(41,73,199,.16) 25px 26px) 0 70px / 100% calc(100% - 100px) no-repeat, #efebe1`,
  [SheetKind.Board]: `${GRAIN}, linear-gradient(270deg, rgba(60,40,20,.12), transparent 7%), #c9b494`,
};

/** The front of a sheet: its paper or chipboard, the punched holes, and what's on it. */
export function Sheet({ kind = SheetKind.Paper, children, style }: { kind?: SheetKind; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", ...FACE[kind], ...style }}>
      <Holes side="left" />
      {children}
    </div>
  );
}

/** The back of a sheet, seen as it turns and once it lies open on the left. */
export function SheetBack({ kind, children, style }: { kind: SheetKind; children?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", background: BACK[kind], borderRadius: kind === SheetKind.Board ? "12px 3px 3px 12px" : "9px 2px 2px 9px", ...style }}>
      <Holes side="right" />
      {children}
    </div>
  );
}

/** The chipboard back cover under the pages, with the notebook's shadow on the desk. */
export function BackBoard() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: "-3px -7px -9px 0",
        borderRadius: "3px 13px 13px 3px",
        background: `${GRAIN}, ${COLORS.cover}`,
        boxShadow: `0 22px 40px -12px rgba(40,25,10,.45), 0 4px 10px rgba(40,25,10,.2), inset -3px -3px 0 ${COLORS.coverEdge}`,
      }}
    />
  );
}

/* ------------------------------------------------------------------ lettering */

type Scrap = { bg: string; color: string; font: string; rotate: number; upper: boolean; drop: number };
// Letters cut from different magazines: paper, ink and type all vary.
const SCRAPS: [Scrap, ...Scrap[]] = [
  { bg: "#f7f3ea", color: COLORS.ink, font: FONT.serif, rotate: -4, upper: false, drop: 2 },
  { bg: "#1f1c1a", color: "#f3efe5", font: FONT.typed, rotate: 3, upper: true, drop: -2 },
  { bg: "#d6d0c4", color: COLORS.ink, font: FONT.marker, rotate: -2, upper: true, drop: 1 },
  { bg: "#ffffff", color: COLORS.ink, font: FONT.serif, rotate: 5, upper: true, drop: -1 },
  { bg: COLORS.sage, color: COLORS.ink, font: FONT.typed, rotate: -3, upper: false, drop: 3 },
  { bg: "#e9e2d2", color: COLORS.ink, font: FONT.serif, rotate: 2, upper: false, drop: 0 },
  { bg: COLORS.kraft, color: "#fff8ee", font: FONT.marker, rotate: -5, upper: false, drop: -2 },
  { bg: "#cfd8f5", color: COLORS.blue, font: FONT.serif, rotate: 4, upper: true, drop: 1 },
];

/** Words in ransom-note letters, each cut from a different scrap. Screen readers get the plain words. */
export function Ransom({ text, size, style }: { text: string; size: number; style?: CSSProperties }) {
  let n = 0;
  return (
    <span style={{ display: "block", ...style }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", gap: `${size * 0.18}px ${size * 0.3}px` }}>
        {text
          .split(/\s+/)
          .filter(Boolean)
          .map((word, w) => (
            <span key={w} style={{ display: "inline-flex", flexWrap: "wrap", gap: 2 }}>
              {[...word].map((ch, i) => {
                const s = SCRAPS[(n++ * 5 + ch.charCodeAt(0)) % SCRAPS.length] ?? SCRAPS[0];
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      padding: `${size * 0.04}px ${size * 0.1}px`,
                      background: `${GRAIN}, ${s.bg}`,
                      color: s.color,
                      fontFamily: s.font,
                      fontSize: size,
                      lineHeight: 1.05,
                      textTransform: s.upper ? "uppercase" : "lowercase",
                      transform: `translateY(${s.drop}px) rotate(${s.rotate}deg)`,
                      boxShadow: "0 1px 2px rgba(0,0,0,.25)",
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
      </span>
    </span>
  );
}

/** Ballpoint script, like a title written straight onto the page. */
export function Script({ children, size = 44, rotate = -4, style }: { children: ReactNode; size?: number; rotate?: number; style?: CSSProperties }) {
  return (
    <span style={{ display: "block", fontFamily: FONT.hand, fontWeight: 700, fontSize: size, lineHeight: 0.95, color: COLORS.blue, transform: `rotate(${rotate}deg)`, ...style }}>
      {children}
    </span>
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

/** A handwritten page number at the foot of the page. */
export function PageNumber({ n }: { n: number }) {
  return <div style={{ marginTop: 22, textAlign: "center", fontFamily: FONT.hand, fontSize: 18, color: COLORS.soft }}>— {n} —</div>;
}

/* ------------------------------------------------------------------ paper bits */

const TAPES = {
  masking: "rgba(214,190,150,.82)",
  sage: "rgba(168,192,132,.78)",
  blue: "rgba(190,205,245,.8)",
  grid: "rgba(235,235,230,.85)",
};
export type TapeTone = keyof typeof TAPES;

const ZIGZAG = "polygon(3% 0, 97% 0, 100% 20%, 97% 40%, 100% 60%, 97% 80%, 100% 100%, 3% 100%, 0 80%, 3% 60%, 0 40%, 3% 20%)";

/** A strip of tape with torn ends. */
export function Tape({ style, tone = "masking", width = 70 }: { style?: CSSProperties; tone?: TapeTone; width?: number }) {
  const pattern =
    tone === "grid"
      ? "repeating-linear-gradient(90deg, rgba(0,0,0,.07) 0 1px, transparent 1px 6px), repeating-linear-gradient(0deg, rgba(0,0,0,.07) 0 1px, transparent 1px 6px)"
      : "repeating-linear-gradient(90deg, rgba(255,255,255,.22) 0 5px, transparent 5px 11px)";
  return <span aria-hidden="true" style={{ position: "absolute", width, height: 20, background: `${pattern}, ${TAPES[tone]}`, clipPath: ZIGZAG, zIndex: 4, ...style }} />;
}

export type Photo = { url: string; alt: string; caption?: string | undefined };

/** A taped polaroid with a handwritten caption. Creators' photos can be any https link. */
export function Polaroid({
  src,
  alt,
  caption,
  width,
  rotate = 0,
  tape = "masking",
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
    <figure style={{ position: "relative", width, margin: 0, padding: "7px 7px 0", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.12), 0 6px 14px rgba(0,0,0,.14)", transform: `rotate(${rotate}deg)`, ...style }}>
      {tape && <Tape tone={tape} width={tapeWidth} style={{ top: -9, left: "50%", marginLeft: -tapeWidth / 2, transform: `rotate(${-rotate * 1.5 - 3}deg)` }} />}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", background: "#e8e4dc", overflow: "hidden" }}>
        <Image src={src} unoptimized={!isOptimizable(src)} alt={alt} fill sizes={`${width}px`} draggable={false} style={{ objectFit: "cover" }} />
      </div>
      <figcaption style={{ fontFamily: FONT.hand, fontSize: 17, color: COLORS.ink, textAlign: "center", padding: "3px 2px 5px", minHeight: 24 }}>{caption}</figcaption>
    </figure>
  );
}

/** A strip of film: up to three frames stacked, sprocket holes down both sides. */
export function FilmStrip({ photos, label, width = 132, rotate = 3, style }: { photos: Photo[]; label: string; width?: number; rotate?: number; style?: CSSProperties }) {
  const sprockets: CSSProperties = { position: "absolute", top: 6, bottom: 6, width: 7, background: "repeating-linear-gradient(#141312 0 5px, rgba(238,234,224,.85) 5px 11px)", borderRadius: 1 };
  return (
    <figure style={{ position: "relative", width, margin: 0, padding: "20px 17px 22px", background: "#141312", boxShadow: "0 6px 16px rgba(0,0,0,.28)", transform: `rotate(${rotate}deg)`, ...style }}>
      <span style={{ ...sprockets, left: 5 }} />
      <span style={{ ...sprockets, right: 5 }} />
      <div style={{ position: "absolute", top: 5, left: 17, right: 17, display: "flex", justifyContent: "space-between", fontFamily: FONT.typed, fontSize: 8, color: "#9b968c", letterSpacing: 0.5 }}>
        <span>CAMERA CLASSIC</span>
        <span>{label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {photos.map((p, i) => (
          <div key={i} style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", background: "#2a2826", overflow: "hidden" }}>
            <Image src={p.url} unoptimized={!isOptimizable(p.url)} alt={p.alt} fill sizes={`${width}px`} draggable={false} style={{ objectFit: "cover" }} />
          </div>
        ))}
      </div>
      <figcaption style={{ position: "absolute", bottom: 6, left: 17, right: 17, fontFamily: FONT.typed, fontSize: 8, color: "#9b968c", whiteSpace: "nowrap", overflow: "hidden" }}>
        {photos.map((p) => p.caption).filter(Boolean).join(" · ")}
      </figcaption>
    </figure>
  );
}

/** A postage stamp with perforated edges, a photo inside. */
export function Stamp({ src, alt, width, label, rotate = 0, style }: { src: string; alt: string; width: number; label: string; rotate?: number; style?: CSSProperties }) {
  return (
    <figure
      style={{
        position: "relative",
        width,
        margin: 0,
        padding: 8,
        // A field of holes; the photo covers all but the half-holes round the edge.
        background: "radial-gradient(circle, transparent 2.6px, #f7f2e6 3px) -5px -5px / 10px 10px",
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,.22))",
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      <div style={{ background: "#f7f2e6", padding: "4px 4px 0", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 5", overflow: "hidden", background: "#e8e4dc" }}>
          <Image src={src} unoptimized={!isOptimizable(src)} alt={alt} fill sizes={`${width}px`} draggable={false} style={{ objectFit: "cover", filter: "sepia(.25)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.typed, fontSize: 9, color: COLORS.ink, padding: "3px 1px" }}>
          <span style={{ fontWeight: 700 }}>10</span>
          <span>{label}</span>
        </div>
      </div>
    </figure>
  );
}

/** Crumpled kraft paper with white handwriting. */
export function KraftNote({ children, rotate = -3, style }: { children: ReactNode; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: "relative",
        padding: "16px 16px 18px",
        background: [
          GRAIN,
          "radial-gradient(60% 40% at 25% 20%, rgba(255,255,255,.2), transparent 70%)",
          "radial-gradient(45% 45% at 80% 75%, rgba(0,0,0,.14), transparent 70%)",
          "linear-gradient(118deg, transparent 38%, rgba(255,255,255,.12) 44%, transparent 50%, rgba(0,0,0,.08) 62%, transparent 68%)",
          COLORS.kraft,
        ].join(", "),
        color: "#fbf6ee",
        fontFamily: FONT.note,
        fontSize: 14.5,
        lineHeight: 1.55,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 3px 8px rgba(0,0,0,.2)",
        overflowWrap: "anywhere",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// A ragged edge, top and bottom.
const TORN =
  "polygon(0 4%, 6% 0, 13% 3%, 21% 1%, 29% 4%, 37% 0, 46% 3%, 55% 1%, 63% 4%, 72% 0, 80% 3%, 89% 1%, 100% 3%, 100% 97%, 92% 100%, 84% 97%, 75% 99%, 66% 96%, 57% 100%, 48% 97%, 39% 99%, 30% 96%, 21% 100%, 12% 97%, 4% 99%, 0 96%)";

/** A scrap of lined notebook paper torn out, with blue rules, taped on when `tape` is given. */
export function TornPaper({ children, rotate = 0, tape, style }: { children: ReactNode; rotate?: number; tape?: TapeTone; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.16))", transform: `rotate(${rotate}deg)`, ...style }}>
      {tape && <Tape tone={tape} width={84} style={{ top: -8, left: "50%", marginLeft: -42 }} />}
      <div
        style={{
          padding: "22px 12px 22px",
          background: `${GRAIN}, linear-gradient(90deg, transparent 22px, rgba(41,73,199,.3) 22px 23px, transparent 23px), repeating-linear-gradient(transparent 0 23px, rgba(41,73,199,.18) 23px 24px), #fbfaf6`,
          clipPath: TORN,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export const NoteTone = { Mint: "mint", Cream: "cream", Blue: "blue" } as const;
export type NoteTone = EnumValue<typeof NoteTone>;
const NOTE_BG: Record<NoteTone, string> = { [NoteTone.Mint]: COLORS.mint, [NoteTone.Cream]: "#f6ecd2", [NoteTone.Blue]: "#dfe6fb" };

/** A square sticky note, its bottom corner lifting. */
export function StickyNote({ children, tone = NoteTone.Mint, rotate = 2, style }: { children: ReactNode; tone?: NoteTone; rotate?: number; style?: CSSProperties | undefined }) {
  return (
    <div
      style={{
        position: "relative",
        padding: "14px 14px 16px",
        background: `${GRAIN}, linear-gradient(170deg, transparent 80%, rgba(0,0,0,.05)), ${NOTE_BG[tone]}`,
        fontFamily: FONT.note,
        fontSize: 14,
        lineHeight: 1.45,
        color: COLORS.ink,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 1px 1px rgba(0,0,0,.08), 6px 8px 10px -6px rgba(0,0,0,.3)",
        overflowWrap: "anywhere",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type CheckRow = { no: string; item: ReactNode; side: ReactNode; onClick?: () => void };

/** A diner guest check: the plan as its order, one line per Stop. */
export function GuestCheck({ heading, rows, total, style }: { heading: string; rows: CheckRow[]; total: ReactNode; style?: CSSProperties | undefined }) {
  const rule = "1px solid rgba(41,73,199,.35)";
  const cell: CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    width: "100%",
    padding: "8px 10px",
    border: 0,
    borderBottom: rule,
    background: "none",
    fontFamily: FONT.typed,
    fontSize: 12.5,
    color: COLORS.ink,
    textAlign: "left",
  };
  return (
    <div style={{ position: "relative", background: `${GRAIN}, #eef2e6`, boxShadow: "0 3px 8px rgba(0,0,0,.16)", transform: "rotate(-1deg)", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 10px 6px", borderBottom: `2px solid ${COLORS.blue}` }}>
        <span style={{ fontFamily: FONT.typed, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: COLORS.blue }}>GUEST CHECK</span>
        <span style={{ fontFamily: FONT.typed, fontSize: 13, color: COLORS.blue }}>No. 0214</span>
      </div>
      <div style={{ fontFamily: FONT.hand, fontSize: 30, fontWeight: 700, lineHeight: 1.1, color: COLORS.ink, padding: "4px 10px 2px", borderBottom: rule, overflowWrap: "anywhere" }}>{heading}</div>
      {rows.map((r, i) => {
        const inner = (
          <>
            <span style={{ fontWeight: 700 }}>{r.no}</span>
            <span style={{ flex: 1, textTransform: "lowercase", overflowWrap: "anywhere" }}>{r.item}</span>
            <span style={{ fontFamily: FONT.hand, fontSize: 19, color: COLORS.blue }}>{r.side}</span>
          </>
        );
        return r.onClick ? (
          <button key={i} type="button" onClick={r.onClick} style={{ ...cell, cursor: "pointer" }}>
            {inner}
          </button>
        ) : (
          <div key={i} style={cell}>
            {inner}
          </div>
        );
      })}
      <div style={{ padding: "8px 10px 10px", fontFamily: FONT.typed, fontSize: 11, color: COLORS.ink }}>{total}</div>
    </div>
  );
}

const TICKET_MASK =
  "radial-gradient(circle at 0 50%, transparent 7px, #000 7.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 7px, #000 7.5px) right / 51% 100% no-repeat";

/** The look of a ticket stub: notched sides and a dashed perforation. Also Yes's button. */
export const ticketStyle = (bg: string = COLORS.sage): CSSProperties => ({
  position: "relative",
  background: `${GRAIN}, ${bg}`,
  mask: TICKET_MASK,
  WebkitMask: TICKET_MASK,
  outline: "1.5px dashed rgba(31,28,26,.45)",
  outlineOffset: -6,
  fontFamily: FONT.typed,
  textTransform: "uppercase",
  color: COLORS.ink,
});

/** A green ticket stub, kept as a souvenir. */
export function Ticket({ children, rotate = -4, style }: { children: ReactNode; rotate?: number; style?: CSSProperties }) {
  return (
    <div style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.2))", transform: `rotate(${rotate}deg)`, ...style }}>
      <div style={{ ...ticketStyle(), padding: "10px 20px", fontSize: 11, fontWeight: 700, letterSpacing: 1, lineHeight: 1.35, textAlign: "center" }}>{children}</div>
    </div>
  );
}

/** Green street-name plates on a pole, and a black one-way arrow that opens the map. */
export function StreetSign({ lines, mapUrl, style }: { lines: string[]; mapUrl: string | null; style?: CSSProperties }) {
  const plate: CSSProperties = {
    display: "inline-block",
    maxWidth: 230,
    padding: "4px 10px",
    background: COLORS.accent,
    color: "#fff",
    fontFamily: FONT.sign,
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1.2,
    border: "2px solid #fff",
    outline: `1.5px solid ${COLORS.accent}`,
    borderRadius: 4,
    boxShadow: "0 2px 4px rgba(0,0,0,.25)",
    overflowWrap: "anywhere",
  };
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, paddingLeft: 12, transform: "rotate(-3deg)", ...style }}>
      <span aria-hidden="true" style={{ position: "absolute", left: 3, top: 0, bottom: -12, width: 5, background: "linear-gradient(90deg, #8d8d8d, #e8e8e8, #7a7a7a)", borderRadius: 2 }} />
      {lines.map((l, i) => (
        <span key={i} style={{ ...plate, transform: `rotate(${i % 2 ? 4 : 0}deg)` }}>
          {l}
        </span>
      ))}
      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "4px 12px 4px 10px",
            background: "#151413",
            color: "#fff",
            fontFamily: FONT.sign,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 1,
            border: "2px solid #fff",
            outline: "1.5px solid #151413",
            borderRadius: 3,
            textDecoration: "none",
            boxShadow: "0 2px 4px rgba(0,0,0,.25)",
            transform: "rotate(-2deg)",
          }}
        >
          OPEN THE MAP ➜
        </a>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ stuck-on things */

/** A black binder clip with silver handles, clipping whatever is under it. */
export function BinderClip({ style }: { style?: CSSProperties }) {
  return (
    <svg width="44" height="50" viewBox="0 0 44 50" aria-hidden="true" style={{ position: "absolute", zIndex: 5, ...style }}>
      <path d="M13 28 L9 5 Q9 2 12 2 H32 Q35 2 35 5 L31 28" fill="none" stroke="#c4c4c4" strokeWidth="2.6" />
      <path d="M13 28 L9 5 Q9 2 12 2 H32" fill="none" stroke="#f2f2f2" strokeWidth=".9" />
      <path d="M4 24 H40 L36 48 H8 Z" fill="#1c1b1a" />
      <path d="M6 26 H38" stroke="rgba(255,255,255,.25)" strokeWidth="1.2" />
    </svg>
  );
}

/** A blue ribbon bow. */
export function Bow({ size = 56, style }: { size?: number; style?: CSSProperties }) {
  const line = { fill: "none", stroke: COLORS.blue, strokeWidth: 3.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden="true" style={{ position: "absolute", zIndex: 5, ...style }}>
      <path d="M30 22C20 7 5 10 8 20s16 8 22 2" {...line} />
      <path d="M30 22C40 7 55 10 52 20s-16 8-22 2" {...line} />
      <path d="M28 24C24 36 20 46 13 57" {...line} />
      <path d="M32 24C37 35 41 45 48 55" {...line} />
      <circle cx="30" cy="22" r="3.4" fill={COLORS.blue} />
    </svg>
  );
}

const DOTS = [
  [6, 6],
  [22, 4],
  [38, 8],
  [12, 20],
  [28, 19],
  [44, 23],
  [4, 34],
  [20, 34],
  [36, 37],
  [14, 48],
  [30, 50],
] as const;

/** A cluster of blue dot stickers. */
export function Dots({ style }: { style?: CSSProperties }) {
  return (
    <svg width="50" height="56" viewBox="0 0 50 56" aria-hidden="true" style={{ position: "absolute", zIndex: 3, ...style }}>
      {DOTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={COLORS.blue} />
      ))}
    </svg>
  );
}

/** A looping doodled arrow, pointing down and to the left. */
export function DoodleArrow({ style }: { style?: CSSProperties }) {
  const line = { fill: "none", stroke: COLORS.brown, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="70" height="62" viewBox="0 0 70 62" aria-hidden="true" style={{ position: "absolute", zIndex: 3, ...style }}>
      <path d="M64 8C46 1 32 18 45 24c14 6 10-16-6-11C24 18 19 36 15 52" {...line} />
      <path d="M6 43l9 11 8-12" {...line} />
    </svg>
  );
}

export const StickerKind = { Star: "star", Heart: "heart", Sun: "sun", Butterfly: "butterfly" } as const;
export type StickerKind = EnumValue<typeof StickerKind>;

/** A hand-drawn sticker. */
export function Sticker({ kind, size = 34, style }: { kind: StickerKind; size?: number; style?: CSSProperties }) {
  const line = { stroke: COLORS.ink, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ position: "absolute", zIndex: 3, ...style }}>
      {kind === StickerKind.Star && <path d="M20 4l4.6 10 10.9 1.2-8.2 7.4 2.4 10.8L20 27.9 10.3 33.4l2.4-10.8-8.2-7.4L15.4 14z" fill="#f4c64e" {...line} />}
      {kind === StickerKind.Heart && <path d="M20 34S5 25 5 15a7.5 7.5 0 0 1 15-1.5A7.5 7.5 0 0 1 35 15c0 10-15 19-15 19z" fill="#f3c7b4" {...line} />}
      {kind === StickerKind.Sun && (
        <g {...line}>
          <circle cx="20" cy="20" r="8" fill="#f0a050" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="20" y1="5" x2="20" y2="9" transform={`rotate(${a} 20 20)`} />
          ))}
        </g>
      )}
      {kind === StickerKind.Butterfly && (
        <g fill="#9cc7ef" stroke="#3b5f8f" strokeWidth="1.1" strokeLinejoin="round">
          <path d="M20 19C13 5 2 7 5 17c2 6 9 6 15 3z" />
          <path d="M20 19C27 5 38 7 35 17c-2 6-9 6-15 3z" />
          <path d="M20 21c-6 4-10 12-5 12 3 0 5-6 5-11z" />
          <path d="M20 21c6 4 10 12 5 12-3 0-5-6-5-11z" />
          <path d="M20 13v19" stroke="#22344d" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
