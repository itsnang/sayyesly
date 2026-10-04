"use client";

// PROTOTYPE variant B: "Turn the pages". Up front: the pad is already open on the cover
// (title, byline, the plan, a taped collage), rings along the TOP (the owner's pick). Swipe
// right to left and the sheet slides off to the left under your finger, tilting from its
// top corner, with the next one underneath; swipe left to right to slide the last one back.
// The question is the last page.
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { EXAMPLE } from "./example";
import { Chapter } from "./chapter";
import { BOARD_BG, C, FONT, LabelButton, LabelStrip, MarkerWords, Page, Polaroid, Rings, Sticker, TypedCard } from "./pieces";

const FLIP_MS = 520;
const SETTLE_MS = 220;
/** How far a finger must travel before letting go turns the page. */
const THRESHOLD = 60;
/** How far left a sheet travels to be fully off the pad. */
const OFF = 430;

type Flip = { index: number; from: string; dir: "fwd" | "back" };
type Drag = { d: number; dir: "fwd" | "back"; active: boolean };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** A sheet `d` px (≤ 0) to the left, dipping and tilting as it goes, like sliding it off the pad. */
const slide = (d: number) => `translate(${d}px, ${-d * 0.06}px) rotate(${d * 0.035}deg)`;
/** Where the sheet being dragged sits: forward follows the finger, back brings the last one in from the left. */
const fwdAt = (d: number) => clamp(d, -OFF, 0);
const backAt = (d: number) => clamp(-OFF + d * 1.2, -OFF, 0);

export function VariantB({ report }: { report: (state: string) => void }) {
  const total = EXAMPLE.stops.length + 2; // cover + chapters + question
  const [page, setPage] = useState(0);
  const [flip, setFlip] = useState<Flip | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    report(`page=${page + 1}/${total}${drag?.active ? ` dragging=${Math.round(drag.d)}px` : ""}${picking ? " picking-day" : ""}${answer ? ` answer=${answer}` : ""}`);
  }, [page, total, drag, picking, answer, report]);

  // Horizontal only, like a book: right to left turns forward, left to right turns back.
  // Vertical movement is left to the browser (scrolling).
  const delta = (e: PointerEvent) => {
    const s = start.current;
    if (!s) return 0;
    const dx = e.clientX - s.x;
    return Math.abs(dx) > Math.abs(e.clientY - s.y) ? dx : 0;
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (flip || (e.target instanceof Element && e.target.closest("button, a"))) return;
    start.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic or already-ended pointers can't be captured; the swipe still works.
    }
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const d = delta(e);
    if (d < 0 && page + 1 < total) setDrag({ d, dir: "fwd", active: true });
    else if (d > 0 && page > 0) setDrag({ d, dir: "back", active: true });
    else setDrag(null);
  };

  // Not far enough (or cancelled): let the sheet fall back where it was. Reads the latest
  // drag through the updater, since a quick release can beat the last re-render.
  const settle = () => {
    setDrag((d) => (d ? { d: 0, dir: d.dir, active: false } : null));
    setTimeout(() => setDrag(null), SETTLE_MS);
  };

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const d = delta(e);
    start.current = null;
    // Decide from the distance itself, not from `drag`: a fast flick can end before React
    // has re-rendered with the last move.
    if (d < -THRESHOLD && page + 1 < total) {
      setFlip({ index: page, from: slide(fwdAt(d)), dir: "fwd" });
      setPage(page + 1);
      setDrag(null);
      setTimeout(() => setFlip(null), FLIP_MS);
    } else if (d > THRESHOLD && page > 0) {
      setFlip({ index: page, from: slide(backAt(d)), dir: "back" });
      setPage(page - 1);
      setDrag(null);
      setTimeout(() => setFlip(null), FLIP_MS);
    } else {
      settle();
    }
  };

  // The browser took the gesture over (a scroll, a call): put the page back.
  const onCancel = () => {
    start.current = null;
    settle();
  };

  const render = (i: number) => {
    if (i === 0) return <Cover />;
    if (i <= EXAMPLE.stops.length) return <Chapter stop={EXAMPLE.stops[i - 1]!} n={i} />;
    return <Question answer={answer} picking={picking} onYes={() => setPicking(true)} onLater={() => setAnswer("maybe later")} onDay={(d) => setAnswer(`yes, ${d}`)} />;
  };

  // What lies flat underneath, and what (if anything) is lifted over it.
  let base = page;
  let overlay: { index: number; style: CSSProperties } | null = null;
  if (flip?.dir === "fwd") {
    overlay = { index: flip.index, style: { ["--from" as string]: flip.from, animation: `b-fwd ${FLIP_MS}ms ease-out forwards` } };
  } else if (flip?.dir === "back") {
    base = flip.index;
    overlay = { index: page, style: { ["--from" as string]: flip.from, animation: `b-back ${FLIP_MS}ms ease-out forwards` } };
  } else if (drag?.dir === "fwd") {
    base = page + 1;
    overlay = { index: page, style: { transform: slide(fwdAt(drag.d)), transition: drag.active ? "none" : `transform ${SETTLE_MS}ms ease` } };
  } else if (drag?.dir === "back") {
    overlay = {
      index: page - 1,
      style: {
        transform: slide(drag.active ? backAt(drag.d) : -OFF),
        opacity: drag.active ? 1 : 0,
        transition: drag.active ? "none" : `transform ${SETTLE_MS}ms ease, opacity ${SETTLE_MS}ms`,
      },
    };
  }

  const sheet = { position: "absolute" as const, inset: 0, overflow: "hidden" };
  const last = page + 1 === total;

  return (
    <main style={{ minHeight: "100dvh", background: BOARD_BG, display: "grid", placeItems: "center", padding: "78px 16px 96px" }}>
      <style>{`
        @keyframes b-fwd { from { transform: var(--from) } to { transform: ${slide(-OFF)}; opacity: 0 } }
        @keyframes b-back { from { transform: var(--from) } to { transform: none } }
      `}</style>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        // Without this, starting on a photo drags the image and cancels the swipe.
        onDragStart={(e) => e.preventDefault()}
        style={{ position: "relative", width: "min(360px, 92vw)", height: 620, touchAction: "pan-y", userSelect: "none", cursor: flip ? "default" : "grab" }}
      >
        {/* the pages underneath, so the pad looks thick */}
        <div style={{ ...sheet, transform: "translate(5px, 6px)", background: "#f1efe9", boxShadow: "0 2px 4px rgba(0,0,0,.12)" }} />
        <div style={{ ...sheet, transform: "translate(2px, 3px)", background: "#f7f5f0" }} />
        <Page holes="top" style={{ ...sheet, paddingTop: 18 }}>
          {render(base)}
        </Page>
        {overlay && (
          <Page holes="top" style={{ ...sheet, paddingTop: 18, transformOrigin: "top right", zIndex: 2, boxShadow: "0 10px 24px rgba(0,0,0,.22)", ...overlay.style }}>
            {render(overlay.index)}
          </Page>
        )}
        <Rings horizontal />
      </div>
      <div style={{ width: "min(360px, 92vw)", textAlign: "center", marginTop: 16, fontFamily: FONT.hand, fontSize: 20, color: C.ink }}>
        {last ? "→ swipe right to look back" : page === 0 ? "swipe left to turn the page ←" : "← next · back →"}
        <span style={{ display: "block", fontFamily: FONT.marker, fontSize: 13, marginTop: 2 }}>
          {page + 1} / {total}
        </span>
      </div>
    </main>
  );
}

function Cover() {
  return (
    <div style={{ position: "relative", padding: "26px 24px", minHeight: 560 }}>
      <div style={{ fontFamily: FONT.hand, fontSize: 48, fontWeight: 700, lineHeight: 0.9, color: C.ink, maxWidth: 220 }}>{EXAMPLE.title}</div>
      <LabelStrip style={{ marginTop: 10 }}>{EXAMPLE.byline}</LabelStrip>
      <TypedCard tone="cream" rotate={1.5} style={{ margin: "16px 70px 0 0" }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>the plan:</div>
        {EXAMPLE.stops.map((s, i) => (
          <div key={s.title}>
            {i + 1}. {s.title.toLowerCase()} · {s.time}
          </div>
        ))}
      </TypedCard>
      <MarkerWords style={{ right: 22, top: 96, maxWidth: 90 }}>swipe ← for each chapter</MarkerWords>
      <Polaroid src="/examples/food.png" width={112} rotate={-6} style={{ position: "absolute", left: 34, bottom: 44 }} tape="grid" />
      <Polaroid src="/examples/vibe.png" width={104} rotate={5} style={{ position: "absolute", right: 18, bottom: 150 }} tape="sage" />
      <Polaroid src="/examples/place.png" width={108} rotate={-2} style={{ position: "absolute", right: 40, bottom: 16 }} tape="pink" />
      <Sticker kind="sun" style={{ right: 26, top: 30 }} size={44} />
    </div>
  );
}

function Question({
  answer,
  picking,
  onYes,
  onLater,
  onDay,
}: {
  answer: string | null;
  picking: boolean;
  onYes: () => void;
  onLater: () => void;
  onDay: (day: string) => void;
}) {
  return (
    <div style={{ position: "relative", padding: "40px 24px", minHeight: 560, textAlign: "center" }}>
      <Sticker kind="heart" size={44} style={{ top: 26, left: 22 }} />
      <div style={{ fontFamily: FONT.marker, fontSize: 15, color: C.soft }}>so, after all that…</div>
      <h1 style={{ fontFamily: FONT.hand, fontSize: 44, lineHeight: 1.05, color: C.ink, margin: "14px 0 26px" }}>{EXAMPLE.question}</h1>
      {answer ? (
        <div style={{ fontFamily: FONT.hand, fontSize: 44, fontWeight: 700, color: C.brown }}>{answer.startsWith("yes") ? `It's a date! ✦ ${answer.slice(5)}` : "Another time ♡"}</div>
      ) : picking ? (
        <div>
          <div style={{ fontFamily: FONT.hand, fontSize: 24, marginBottom: 8 }}>which day?</div>
          {EXAMPLE.days.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDay(d)}
              style={{ display: "inline-block", margin: 6, padding: "10px 14px", fontFamily: FONT.marker, fontSize: 16, background: C.sage, color: "#fff", border: 0, transform: "rotate(-2deg)", cursor: "pointer" }}
            >
              {d}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <LabelButton tone="accent" onClick={onYes}>Yes, all three ✦</LabelButton>
          <LabelButton tone="plain" onClick={onLater}>maybe later</LabelButton>
        </div>
      )}
    </div>
  );
}
