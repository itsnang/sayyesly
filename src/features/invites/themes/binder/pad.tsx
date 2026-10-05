"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import type { EnumValue } from "@/lib/enums";
import { COLORS } from "./palette";
import { BackBoard, FONT, Rings, Sheet, SheetBack, SheetKind, Tab } from "./pieces";

/** How long a whole turn takes; part of one takes its share. */
const TURN_MS = 720;
/** How far a finger must travel before letting go turns the page. */
const THRESHOLD = 60;
/** Movement smaller than this is still a tap. */
const SLOP = 8;
const RAD = Math.PI / 180;

/** Which way a page turns: forward (swiped right to left, up over the rings) or back down. */
const TurnDir = { Forward: "forward", Back: "back" } as const;
type TurnDir = EnumValue<typeof TurnDir>;

/** A page of the binder: what it's made of, and its divider tab (none on the cover). */
export type PadPage = { kind: SheetKind; tab: { label: string; name: string } | null };

/**
 * Which sheets are drawn: the one lying flat on top, and the one turning over
 * it. `angle` is how far that one has turned: 0 lies on the pad, 180 has gone
 * over the rings. When `to` is set it's finishing on its own, then `next` is the page.
 */
type Flip = { moving: number; base: number; dir: TurnDir; to: number | null; next: number };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Draws a sheet turned `angle` degrees up over the rings, its shading, and its shadow on the page below. */
function paint(sheet: HTMLElement | undefined, under: HTMLElement | undefined, angle: number | null) {
  if (sheet) {
    const a = angle ?? 0;
    // A slight twist, as if lifted by its bottom right corner.
    sheet.style.transform = angle === null ? "" : `rotateX(${a}deg) rotateY(${-Math.sin(a * RAD) * 7}deg)`;
    const front = sheet.querySelector<HTMLElement>("[data-shade=front]");
    const back = sheet.querySelector<HTMLElement>("[data-shade=back]");
    if (front) front.style.opacity = String((Math.min(a, 90) / 90) * 0.32);
    if (back) back.style.opacity = String((clamp(180 - a, 0, 90) / 90) * 0.28);
  }
  const cast = under?.querySelector<HTMLElement>("[data-shade=cast]");
  if (cast) cast.style.opacity = angle === null ? "0" : String(Math.sin(clamp(angle, 0, 90) * RAD) * clamp(1 - angle / 150, 0, 1));
}

/**
 * A binder on top rings: a cloth cover, then grid-paper pages with divider tabs
 * along the bottom. Swipe right to left and the sheet lifts by its corner and
 * turns up over the rings, following the finger; left to right brings the last
 * one back down; a short swipe drops back. Tapping a tab turns to that page.
 * Vertical movement stays the browser's (each page scrolls). ← / → keys and the
 * screen-reader buttons turn pages too. Pages hold no state of their own:
 * `render` is called for each sheet drawn, so whatever they show lives above.
 */
export function Pad({ pages, render }: { pages: PadPage[]; render: (index: number, goTo: (index: number) => void) => ReactNode }) {
  const count = pages.length;
  const [page, setPage] = useState(0);
  const [flip, setFlip] = useState<Flip | null>(null);
  // Until the first touch, the cover lifts now and then to show it opens.
  const [touched, setTouched] = useState(false);
  const start = useRef<{ x: number; y: number; dragging: boolean } | null>(null);
  const angle = useRef(0);
  const sheets = useRef(new Map<number, HTMLDivElement>());
  const pad = useRef<HTMLDivElement>(null);

  const turn = (dir: TurnDir, to: number) => {
    if (flip || to === page || to < 0 || to >= count) return;
    setTouched(true);
    angle.current = dir === TurnDir.Forward ? 0 : 180;
    setFlip(dir === TurnDir.Forward ? { moving: page, base: to, dir, to: 180, next: to } : { moving: to, base: page, dir, to: 0, next: to });
  };
  const goTo = (index: number) => turn(index > page ? TurnDir.Forward : TurnDir.Back, index);

  // Draw the turning sheet where it is, then (when it's finishing) run it home.
  useLayoutEffect(() => {
    for (const [i, el] of sheets.current) if (i !== flip?.moving) paint(el, el, null);
    if (!flip) return;
    const sheet = sheets.current.get(flip.moving);
    const under = sheets.current.get(flip.base);
    paint(sheet, under, angle.current);
    if (flip.to === null) return;
    const from = angle.current;
    const to = flip.to;
    const ms = Math.max(160, (Math.abs(to - from) / 180) * TURN_MS);
    const began = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - began) / ms);
      angle.current = from + (to - from) * easeOut(t);
      paint(sheet, under, angle.current);
      if (t < 1) frame = requestAnimationFrame(step);
      else {
        setPage(flip.next);
        setFlip(null);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [flip]);

  /** How far the finger has turned the sheet, from the horizontal travel only. */
  const angleFor = (dir: TurnDir, dx: number) => {
    const width = pad.current?.offsetWidth ?? 340;
    const turned = clamp((Math.abs(dx) / width) * 190, 0, 180);
    return dir === TurnDir.Forward ? (dx < 0 ? turned : 0) : dx > 0 ? 180 - turned : 180;
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (flip || (e.target instanceof Element && e.target.closest("button, a, input, textarea, label"))) return;
    setTouched(true);
    start.current = { x: e.clientX, y: e.clientY, dragging: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // An already-ended pointer can't be captured; the swipe still works without it.
    }
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (!s.dragging) {
      // A mostly vertical move is a scroll; let the browser have it.
      if (Math.abs(dx) < SLOP || Math.abs(dx) < Math.abs(e.clientY - s.y)) return;
      if (dx < 0 && page + 1 < count) {
        angle.current = 0;
        setFlip({ moving: page, base: page + 1, dir: TurnDir.Forward, to: null, next: page });
      } else if (dx > 0 && page > 0) {
        angle.current = 180;
        setFlip({ moving: page - 1, base: page, dir: TurnDir.Back, to: null, next: page });
      } else return;
      s.dragging = true;
      return;
    }
    if (!flip || flip.to !== null) return;
    angle.current = angleFor(flip.dir, dx);
    paint(sheets.current.get(flip.moving), sheets.current.get(flip.base), angle.current);
  };

  const release = (dx: number) => {
    const s = start.current;
    start.current = null;
    if (!s?.dragging) return;
    // From the distance itself, as well as the angle: a fast flick can end before the last move is drawn.
    setFlip((f) => {
      if (!f || f.to !== null) return f;
      if (f.dir === TurnDir.Forward) return dx < -THRESHOLD ? { ...f, to: 180, next: f.base } : { ...f, to: 0, next: f.moving };
      return dx > THRESHOLD ? { ...f, to: 0, next: f.moving } : { ...f, to: 180, next: f.base };
    });
  };

  // Not turning: the page lies flat. Before the first touch, the cover peeks open over page 2.
  const peeking = !flip && !touched && page === 0 && count > 1;
  const base = flip?.base ?? (peeking ? 1 : page);
  const moving = flip?.moving ?? (peeking ? 0 : null);
  const drawn = moving === null ? [base] : [base, moving];
  // The last page turned lies flat above the rings, as on a desk; a turn lands on it.
  const turned = Math.min(base, moving ?? base) - 1;
  const turnedKind = pages[turned]?.kind;
  const underneath = Math.max(0, count - 1 - Math.max(base, moving ?? 0));
  const tabbed = pages.filter((p) => p.tab).length;
  /** A tab's place along the bottom: its page's place among the pages with tabs. */
  const slotOf = (i: number) => pages.slice(0, i).filter((p) => p.tab).length;
  const last = page + 1 === count;

  const tab = (i: number, onClick?: () => void) => {
    const spec = pages[i]?.tab;
    return spec ? <Tab key={`tab-${i}`} label={spec.label} name={spec.name} slot={slotOf(i)} of={tabbed} {...(onClick ? { onClick } : {})} /> : null;
  };

  const face: CSSProperties = { position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
  const shade: CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none", opacity: 0, borderRadius: "inherit" };

  return (
    <div style={{ width: "min(380px, 100%)" }}>
      <style>{`
        @keyframes binder-peek {
          0%, 64%, 100% { transform: none }
          74% { transform: rotateX(26deg) rotateY(-4deg) }
          84% { transform: rotateX(4deg) }
          90% { transform: rotateX(9deg) }
        }
      `}</style>
      <div
        ref={pad}
        role="region"
        aria-roledescription="binder"
        aria-label={`Page ${page + 1} of ${count}`}
        tabIndex={0}
        onKeyDown={(e) => {
          // Only on the binder itself: arrows typed in the note or time box move the cursor.
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowLeft") turn(TurnDir.Back, page - 1);
          if (e.key === "ArrowRight") turn(TurnDir.Forward, page + 1);
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={(e) => release(start.current ? e.clientX - start.current.x : 0)}
        onPointerCancel={() => release(0)}
        // Without this, a swipe starting on a photo drags the image instead.
        onDragStart={(e) => e.preventDefault()}
        style={{
          position: "relative",
          height: "min(660px, calc(100svh - 170px))",
          minHeight: 500,
          marginBottom: 30,
          perspective: 1900,
          perspectiveOrigin: "50% 0%",
          touchAction: "pan-y",
          userSelect: "none",
          outline: "none",
        }}
      >
        <BackBoard />
        {/* the pages still to come: their edges, and their tabs to jump to */}
        {Array.from({ length: Math.min(underneath, 4) }, (_, k) => (
          <div
            key={`edge-${k}`}
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, transform: `translateY(${(Math.min(underneath, 4) - k) * 2}px)`, background: k % 2 ? "#f6f3ec" : "#ebe6dc", borderRadius: 2 }}
          />
        ))}
        {pages.map((_, i) => (i > base && i > (moving ?? 0) ? tab(i, () => goTo(i)) : null))}

        {turnedKind && (
          <SheetBack
            key={`turned-${turned}`}
            kind={turnedKind}
            style={{ position: "absolute", inset: 0, zIndex: 1, transformOrigin: "50% 0", transform: "rotateX(180deg)", backfaceVisibility: "visible" }}
          />
        )}
        {drawn.map((i) => {
          const spec = pages[i];
          if (!spec) return null;
          const live = i === page;
          const turning = i === moving;
          return (
            <div
              key={`page-${i}`}
              ref={(el) => {
                if (el) sheets.current.set(i, el);
                else sheets.current.delete(i);
              }}
              aria-hidden={!live}
              inert={!live}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: turning ? 3 : 2,
                transformOrigin: "50% 0",
                transformStyle: "preserve-3d",
                pointerEvents: live && !flip ? undefined : "none",
                animation: peeking && turning ? "binder-peek 3.4s ease-in-out 1s infinite" : undefined,
              }}
            >
              <Sheet kind={spec.kind} style={{ ...face, boxShadow: turning ? "0 8px 22px rgba(0,0,0,.22)" : undefined }}>
                {spec.kind === SheetKind.Board ? (
                  render(i, goTo)
                ) : (
                  <div style={{ position: "absolute", inset: 0, overflowY: "auto", overscrollBehavior: "contain", paddingTop: 22 }}>{render(i, goTo)}</div>
                )}
                {tab(i)}
                <span data-shade="cast" style={{ ...shade, background: "linear-gradient(to top, rgba(40,25,10,.3), rgba(40,25,10,.08) 55%, transparent)" }} />
                <span data-shade="front" style={{ ...shade, background: "linear-gradient(to bottom, rgba(0,0,0,.1), #000)" }} />
              </Sheet>
              <SheetBack kind={spec.kind} style={{ ...face, transform: "rotateX(180deg)" }}>
                <span data-shade="back" style={{ ...shade, background: "linear-gradient(to top, #fff, rgba(255,255,255,.2))" }} />
              </SheetBack>
            </div>
          );
        })}
        <Rings />
      </div>

      <div style={{ textAlign: "center", fontFamily: FONT.hand, fontSize: 20, color: COLORS.ink }}>
        <span aria-hidden="true">{last ? "→ swipe right to look back" : page === 0 ? "swipe ← to open" : "← next · back →"}</span>
        <span style={{ display: "block", fontFamily: FONT.marker, fontSize: 13, marginTop: 2 }}>
          {page + 1} / {count}
        </span>
        <button type="button" className="sr-only focus:not-sr-only" onClick={() => turn(TurnDir.Back, page - 1)} disabled={page === 0}>
          Previous page
        </button>
        <button type="button" className="sr-only focus:not-sr-only" onClick={() => turn(TurnDir.Forward, page + 1)} disabled={last}>
          Next page
        </button>
      </div>
    </div>
  );
}
