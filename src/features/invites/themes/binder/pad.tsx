"use client";

import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import type { EnumValue } from "@/lib/enums";
import { COLORS } from "./palette";
import { FONT, Rings, Sheet } from "./pieces";

const TURN_MS = 520;
const SETTLE_MS = 220;
/** How far a finger must travel before letting go turns the page. */
const THRESHOLD = 60;
/** How far left a sheet travels to be off the pad. */
const OFF = 430;

/** Which way a page turns: forward (right to left) or back. */
const TurnDir = { Forward: "forward", Back: "back" } as const;
type TurnDir = EnumValue<typeof TurnDir>;

type Turn = { index: number; from: string; dir: TurnDir };
type Drag = { d: number; dir: TurnDir; active: boolean };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
/** A sheet `d` px (≤ 0) to the left, dipping and tilting as it goes, like sliding it off the pad. */
const slide = (d: number) => `translate(${d}px, ${-d * 0.06}px) rotate(${d * 0.035}deg)`;
const fwdAt = (d: number) => clamp(d, -OFF, 0);
const backAt = (d: number) => clamp(-OFF + d * 1.2, -OFF, 0);

/**
 * A pad of grid-paper sheets on the top rings. Swipe right to left and the sheet
 * follows the finger off to the left, the next one underneath; left to right
 * slides the last one back; a short swipe settles back. Vertical movement stays
 * the browser's (each sheet scrolls). ← / → keys and the screen-reader buttons
 * turn pages too. Pages hold no state of their own: `render` is called for the
 * sheet underneath and the one moving, so whatever they show lives above.
 */
export function Pad({ count, render }: { count: number; render: (index: number) => ReactNode }) {
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const go = (dir: TurnDir, from: string) => {
    if (turn) return;
    if (dir === TurnDir.Forward ? page + 1 >= count : page === 0) return;
    setTurn({ index: page, from, dir });
    setPage(dir === TurnDir.Forward ? page + 1 : page - 1);
    setDrag(null);
    setTimeout(() => setTurn(null), TURN_MS);
  };

  // Not far enough, or the browser took the gesture over: the sheet falls back.
  // Through the updater, since a quick release can beat the last re-render.
  const settle = () => {
    setDrag((d) => (d ? { d: 0, dir: d.dir, active: false } : null));
    setTimeout(() => setDrag(null), SETTLE_MS);
  };

  /** Horizontal travel only: a mostly vertical move is a scroll. */
  const delta = (e: PointerEvent) => {
    const s = start.current;
    if (!s) return 0;
    const dx = e.clientX - s.x;
    return Math.abs(dx) > Math.abs(e.clientY - s.y) ? dx : 0;
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (turn || (e.target instanceof Element && e.target.closest("button, a, input, textarea, label"))) return;
    start.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // An already-ended pointer can't be captured; the swipe still works without it.
    }
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const d = delta(e);
    if (d < 0 && page + 1 < count) setDrag({ d, dir: TurnDir.Forward, active: true });
    else if (d > 0 && page > 0) setDrag({ d, dir: TurnDir.Back, active: true });
    else setDrag(null);
  };

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const d = delta(e);
    start.current = null;
    // From the distance itself, not `drag`: a fast flick can end before the last move re-renders.
    if (d < -THRESHOLD && page + 1 < count) go(TurnDir.Forward, slide(fwdAt(d)));
    else if (d > THRESHOLD && page > 0) go(TurnDir.Back, slide(backAt(d)));
    else settle();
  };

  const onCancel = () => {
    start.current = null;
    settle();
  };

  // What lies flat underneath, and what (if anything) is moving over it.
  let base = page;
  let moving: { index: number; style: CSSProperties } | null = null;
  if (turn?.dir === TurnDir.Forward) {
    moving = { index: turn.index, style: { ["--from" as string]: turn.from, animation: `binder-off ${TURN_MS}ms ease-out forwards` } };
  } else if (turn?.dir === TurnDir.Back) {
    base = turn.index;
    moving = { index: page, style: { ["--from" as string]: turn.from, animation: `binder-on ${TURN_MS}ms ease-out forwards` } };
  } else if (drag?.dir === TurnDir.Forward) {
    base = page + 1;
    moving = { index: page, style: { transform: slide(fwdAt(drag.d)), transition: drag.active ? "none" : `transform ${SETTLE_MS}ms ease` } };
  } else if (drag?.dir === TurnDir.Back) {
    moving = {
      index: page - 1,
      style: {
        transform: slide(drag.active ? backAt(drag.d) : -OFF),
        opacity: drag.active ? 1 : 0,
        transition: drag.active ? "none" : `transform ${SETTLE_MS}ms ease, opacity ${SETTLE_MS}ms`,
      },
    };
  }

  const sheet: CSSProperties = { position: "absolute", inset: 0, overflow: "hidden", paddingTop: 18 };
  const scroll: CSSProperties = { height: "100%", overflowY: "auto", overscrollBehavior: "contain" };
  const last = page + 1 === count;

  return (
    <div style={{ width: "min(380px, 100%)" }}>
      <style>{`
        @keyframes binder-off { from { transform: var(--from) } to { transform: ${slide(-OFF)}; opacity: 0 } }
        @keyframes binder-on { from { transform: var(--from) } to { transform: none } }
      `}</style>
      <div
        role="region"
        aria-roledescription="pages"
        aria-label={`Page ${page + 1} of ${count}`}
        tabIndex={0}
        onKeyDown={(e) => {
          // Only on the pad itself: arrows typed in the note or time box move the cursor.
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowLeft") go(TurnDir.Back, slide(-OFF));
          if (e.key === "ArrowRight") go(TurnDir.Forward, "none");
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        // Without this, a swipe starting on a photo drags the image instead.
        onDragStart={(e) => e.preventDefault()}
        style={{
          position: "relative",
          height: "min(680px, calc(100svh - 150px))",
          minHeight: 520,
          touchAction: "pan-y",
          userSelect: "none",
          outline: "none",
        }}
      >
        {/* the sheets underneath, so the pad looks thick */}
        <div aria-hidden="true" style={{ ...sheet, transform: "translate(5px, 6px)", background: "#f1efe9", boxShadow: "0 2px 4px rgba(0,0,0,.12)" }} />
        <div aria-hidden="true" style={{ ...sheet, transform: "translate(2px, 3px)", background: "#f7f5f0" }} />
        <Sheet key={`base-${base}`} style={sheet}>
          <div style={scroll}>{render(base)}</div>
        </Sheet>
        {moving && (
          <Sheet key={`moving-${moving.index}`} style={{ ...sheet, transformOrigin: "top right", zIndex: 2, boxShadow: "0 10px 24px rgba(0,0,0,.22)", pointerEvents: "none", ...moving.style }}>
            <div aria-hidden="true" style={scroll}>
              {render(moving.index)}
            </div>
          </Sheet>
        )}
        <Rings />
      </div>

      <div style={{ textAlign: "center", marginTop: 14, fontFamily: FONT.hand, fontSize: 20, color: COLORS.ink }}>
        <span aria-hidden="true">{last ? "→ swipe right to look back" : page === 0 ? "swipe left to turn the page ←" : "← next · back →"}</span>
        <span style={{ display: "block", fontFamily: FONT.marker, fontSize: 13, marginTop: 2 }}>
          {page + 1} / {count}
        </span>
        <button type="button" className="sr-only focus:not-sr-only" onClick={() => go(TurnDir.Back, slide(-OFF))} disabled={page === 0}>
          Previous page
        </button>
        <button type="button" className="sr-only focus:not-sr-only" onClick={() => go(TurnDir.Forward, "none")} disabled={last}>
          Next page
        </button>
      </div>
    </div>
  );
}
