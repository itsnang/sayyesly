"use client";

// PROTOTYPE variant B: "Flip the pad". Up front: the binder is already open on the cover
// (title, byline, numbered Stops, a taped collage, like the PDF's first page). Pages are
// bound at the TOP and flip up over the rings, like a wall calendar. The question is the
// last page, after every chapter.
import { useEffect, useState } from "react";
import { EXAMPLE } from "./example";
import { Chapter } from "./chapter";
import { BOARD_BG, C, Elastic, FONT, LabelButton, Page, Polaroid, Rings, Sticker } from "./pieces";

const FLIP_MS = 650;

export function VariantB({ report }: { report: (state: string) => void }) {
  const total = EXAMPLE.stops.length + 2; // cover + chapters + question
  const [page, setPage] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [back, setBack] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    report(`page=${page + 1}/${total}${picking ? " picking-day" : ""}${answer ? ` answer=${answer}` : ""}`);
  }, [page, total, picking, answer, report]);

  const next = () => {
    if (page + 1 >= total || leaving !== null) return;
    setBack(false);
    setLeaving(page);
    setPage(page + 1);
    setTimeout(() => setLeaving(null), FLIP_MS);
  };
  const prev = () => {
    if (page === 0 || leaving !== null) return;
    setBack(true);
    setPage(page - 1);
    setTimeout(() => setBack(false), FLIP_MS);
  };

  const render = (i: number) => {
    if (i === 0) return <Cover />;
    if (i <= EXAMPLE.stops.length) return <Chapter stop={EXAMPLE.stops[i - 1]!} n={i} />;
    return <Question answer={answer} picking={picking} onYes={() => setPicking(true)} onLater={() => setAnswer("maybe later")} onDay={(d) => setAnswer(`yes, ${d}`)} />;
  };

  const sheet = { position: "absolute" as const, inset: 0, overflow: "hidden" };

  return (
    <main style={{ minHeight: "100dvh", background: BOARD_BG, display: "grid", placeItems: "center", padding: "78px 16px 96px" }}>
      <style>{`
        @keyframes b-up { from { transform: rotateX(0) } to { transform: rotateX(-105deg); opacity: .3 } }
        @keyframes b-down { from { transform: rotateX(-105deg); opacity: .3 } to { transform: rotateX(0) } }
      `}</style>
      <div style={{ position: "relative", width: "min(360px, 92vw)", height: 620, perspective: 1600 }}>
        {/* the pages underneath, so the pad looks thick */}
        <div style={{ ...sheet, transform: "translate(5px, 6px)", background: "#f1efe9", boxShadow: "0 2px 4px rgba(0,0,0,.12)" }} />
        <div style={{ ...sheet, transform: "translate(2px, 3px)", background: "#f7f5f0" }} />
        <Page holes="top" style={{ ...sheet, transformOrigin: "top center", animation: back ? `b-down ${FLIP_MS}ms ease` : undefined, overflowY: "auto", paddingTop: 18 }}>
          {render(page)}
        </Page>
        {leaving !== null && (
          <Page holes="top" style={{ ...sheet, transformOrigin: "top center", animation: `b-up ${FLIP_MS}ms ease forwards`, paddingTop: 18, zIndex: 2 }}>
            {render(leaving)}
          </Page>
        )}
        <Rings horizontal />
        <Elastic style={{ right: -14, top: 60, bottom: 60 }} />
      </div>
      <div style={{ width: "min(360px, 92vw)", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
        <LabelButton tone="plain" onClick={prev}>‹ flip back</LabelButton>
        <span style={{ fontFamily: FONT.marker, fontSize: 14, color: C.ink }}>{page + 1} / {total}</span>
        <LabelButton tone="ink" onClick={next}>flip ›</LabelButton>
      </div>
    </main>
  );
}

function Cover() {
  return (
    <div style={{ position: "relative", padding: "26px 24px", minHeight: 560 }}>
      <div style={{ fontFamily: FONT.display, fontSize: 44, lineHeight: 0.92, color: C.olive }}>
        The
        <br />
        Three
        <br />
        Chapters
      </div>
      <div style={{ fontFamily: FONT.hand, fontSize: 22, color: C.ink, margin: "6px 0 18px" }}>{EXAMPLE.byline}</div>
      {EXAMPLE.stops.map((s, i) => (
        <div key={s.title} style={{ fontFamily: FONT.marker, fontSize: 20, color: C.olive, margin: "6px 0" }}>
          0{i + 1} {s.title}
        </div>
      ))}
      <Polaroid src="/examples/food.png" width={112} rotate={-6} style={{ position: "absolute", left: 34, bottom: 44 }} tape="grid" />
      <Polaroid src="/examples/vibe.png" width={104} rotate={5} style={{ position: "absolute", right: 18, bottom: 150 }} tape="sage" />
      <Polaroid src="/examples/place.png" width={108} rotate={-2} style={{ position: "absolute", right: 40, bottom: 16 }} tape="pink" />
      <Sticker kind="sun" style={{ right: 26, top: 30 }} size={44} />
      <span style={{ position: "absolute", left: 24, bottom: 12, fontFamily: FONT.hand, fontSize: 18, color: C.soft }}>flip up ↑</span>
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
        <div style={{ fontFamily: FONT.display, fontSize: 34, color: C.rust }}>{answer.startsWith("yes") ? `It's a date! ✦ ${answer.slice(5)}` : "Another time ♡"}</div>
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
          <LabelButton tone="red" onClick={onYes}>Yes, all three ✦</LabelButton>
          <LabelButton tone="plain" onClick={onLater}>maybe later</LabelButton>
        </div>
      )}
    </div>
  );
}
