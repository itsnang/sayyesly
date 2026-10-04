"use client";

// PROTOTYPE variant B: "Turn the pages". Up front: the binder is already open on the
// cover (title, byline, the plan, a taped collage). Pages are bound on the LEFT rings like
// a book: swipe right to left and the page follows your finger over the rings; swipe left
// to right to bring the last one back. The question is the last page.
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { EXAMPLE } from "./example";
import { Chapter } from "./chapter";
import { BOARD_BG, C, FONT, LabelButton, LabelStrip, MarkerWords, Page, Polaroid, Rings, Sticker, TypedCard } from "./pieces";

const FLIP_MS = 520;
const SETTLE_MS = 220;
/** How far a finger must travel before letting go turns the page. */
const THRESHOLD = 60;
/** Degrees of lift per pixel dragged. */
const TILT = 0.45;
const OPEN = -110;

type Flip = { index: number; from: number; dir: "fwd" | "back" };
type Drag = { d: number; dir: "fwd" | "back"; active: boolean };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

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

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const d = delta(e);
    start.current = null;
    if (drag?.dir === "fwd" && d < -THRESHOLD) {
      setFlip({ index: page, from: clamp(d * TILT, OPEN, 0), dir: "fwd" });
      setPage(page + 1);
      setDrag(null);
      setTimeout(() => setFlip(null), FLIP_MS);
    } else if (drag?.dir === "back" && d > THRESHOLD) {
      setFlip({ index: page, from: clamp(OPEN + d * TILT, OPEN, 0), dir: "back" });
      setPage(page - 1);
      setDrag(null);
      setTimeout(() => setFlip(null), FLIP_MS);
    } else if (drag) {
      // Not far enough: let the page fall back where it was.
      setDrag({ d: 0, dir: drag.dir, active: false });
      setTimeout(() => setDrag(null), SETTLE_MS);
    }
  };

  // The browser took the gesture over (a scroll, a call): put the page back.
  const onCancel = () => {
    start.current = null;
    if (!drag) return;
    setDrag({ d: 0, dir: drag.dir, active: false });
    setTimeout(() => setDrag(null), SETTLE_MS);
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
    overlay = { index: flip.index, style: { ["--from" as string]: `${flip.from}deg`, animation: `b-fwd ${FLIP_MS}ms ease-out forwards` } };
  } else if (flip?.dir === "back") {
    base = flip.index;
    overlay = { index: page, style: { ["--from" as string]: `${flip.from}deg`, animation: `b-back ${FLIP_MS}ms ease-out forwards` } };
  } else if (drag?.dir === "fwd") {
    base = page + 1;
    overlay = { index: page, style: { transform: `rotateY(${clamp(drag.d * TILT, OPEN, 0)}deg)`, transition: drag.active ? "none" : `transform ${SETTLE_MS}ms ease` } };
  } else if (drag?.dir === "back") {
    overlay = {
      index: page - 1,
      style: {
        transform: `rotateY(${drag.active ? clamp(OPEN + drag.d * TILT, OPEN, 0) : OPEN}deg)`,
        opacity: drag.active ? 1 : 0.3,
        transition: drag.active ? "none" : `transform ${SETTLE_MS}ms ease, opacity ${SETTLE_MS}ms`,
      },
    };
  }

  const sheet = { position: "absolute" as const, inset: 0, overflow: "hidden" };
  const last = page + 1 === total;

  return (
    <main style={{ minHeight: "100dvh", background: BOARD_BG, display: "grid", placeItems: "center", padding: "78px 16px 96px" }}>
      <style>{`
        @keyframes b-fwd { from { transform: rotateY(var(--from)) } to { transform: rotateY(${OPEN}deg); opacity: .2 } }
        @keyframes b-back { from { transform: rotateY(var(--from)) } to { transform: rotateY(0) } }
      `}</style>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        // Without this, starting on a photo drags the image and cancels the swipe.
        onDragStart={(e) => e.preventDefault()}
        style={{ position: "relative", width: "min(360px, 92vw)", height: 620, perspective: 1600, touchAction: "pan-y", userSelect: "none", cursor: flip ? "default" : "grab" }}
      >
        {/* the pages underneath, so the pad looks thick */}
        <div style={{ ...sheet, transform: "translate(5px, 6px)", background: "#f1efe9", boxShadow: "0 2px 4px rgba(0,0,0,.12)" }} />
        <div style={{ ...sheet, transform: "translate(2px, 3px)", background: "#f7f5f0" }} />
        <Page style={sheet}>
          {render(base)}
        </Page>
        {overlay && (
          <Page style={{ ...sheet, transformOrigin: "left center", zIndex: 2, boxShadow: "0 10px 24px rgba(0,0,0,.22)", ...overlay.style }}>
            {render(overlay.index)}
          </Page>
        )}
        <Rings />
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
    <div style={{ position: "relative", padding: "26px 22px 26px 38px", minHeight: 560 }}>
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
    <div style={{ position: "relative", padding: "40px 22px 40px 38px", minHeight: 560, textAlign: "center" }}>
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
