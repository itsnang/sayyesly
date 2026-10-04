"use client";

// PROTOTYPE variant A: "Snap the elastic". Ask first: a closed binder, slide the band
// off, the cover asks the question; after Yes the chapters open, one page at a time,
// turned sideways like a real binder (swipe or arrows).
import { useEffect, useRef, useState } from "react";
import { EXAMPLE } from "./example";
import { Chapter } from "./chapter";
import { BOARD_BG, C, Elastic, FONT, LabelButton, Page, Polaroid, Rings, Sticker, Tape } from "./pieces";

const Stage = { Closed: "closed", Opening: "opening", Ask: "ask", Pages: "pages", Pick: "pick", Done: "done", Later: "later" } as const;
type Stage = (typeof Stage)[keyof typeof Stage];

export function VariantA({ report }: { report: (state: string) => void }) {
  const [stage, setStage] = useState<Stage>(Stage.Closed);
  const [page, setPage] = useState(0);
  const [day, setDay] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);
  const pages = EXAMPLE.stops.length + 1; // contents + one per Stop

  useEffect(() => {
    report(`stage=${stage}${stage === Stage.Pages ? ` page=${page + 1}/${pages}` : ""}${day ? ` day=${day}` : ""}`);
  }, [stage, page, pages, day, report]);

  const open = () => {
    setStage(Stage.Opening);
    setTimeout(() => setStage(Stage.Ask), 900);
  };
  const next = () => (page + 1 < pages ? setPage(page + 1) : setStage(Stage.Pick));
  const prev = () => setPage(Math.max(0, page - 1));

  return (
    <main style={{ minHeight: "100dvh", background: BOARD_BG, display: "grid", placeItems: "center", padding: "24px 16px 96px", perspective: 1400 }}>
      <style>{`@keyframes a-in { from { opacity: 0; transform: translateX(40px) rotate(1deg) } to { opacity: 1; transform: none } }`}</style>

      {(stage === Stage.Closed || stage === Stage.Opening) && (
        <button
          type="button"
          onClick={open}
          aria-label="Open the binder"
          style={{
            position: "relative",
            width: "min(340px, 88vw)",
            aspectRatio: "3 / 4",
            border: 0,
            borderRadius: 10,
            background: `${BOARD_BG}`,
            filter: "brightness(.94)",
            boxShadow: "0 18px 30px rgba(0,0,0,.25), inset 0 0 0 1px rgba(0,0,0,.08)",
            transformOrigin: "left center",
            transition: "transform .8s cubic-bezier(.5,0,.2,1), opacity .8s",
            transform: stage === Stage.Opening ? "rotateY(-105deg)" : "none",
            opacity: stage === Stage.Opening ? 0.2 : 1,
            cursor: "pointer",
          }}
        >
          <div style={{ position: "absolute", left: "12%", right: "22%", top: "22%", padding: "20px 14px", background: C.paper, transform: "rotate(-2deg)", boxShadow: "0 2px 4px rgba(0,0,0,.15)" }}>
            <Tape tone="sage" style={{ top: -10, left: 20, transform: "rotate(-6deg)" }} />
            <div style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 1, color: C.olive, textAlign: "left" }}>{EXAMPLE.title}</div>
            <div style={{ fontFamily: FONT.hand, fontSize: 22, color: C.ink, marginTop: 8 }}>for you ✦</div>
          </div>
          <Sticker kind="heart" style={{ left: "16%", bottom: "16%" }} />
          <Elastic
            style={{
              right: "11%",
              transition: "transform .5s ease, opacity .5s",
              transform: stage === Stage.Opening ? "translateX(60px)" : "none",
              opacity: stage === Stage.Opening ? 0 : 1,
            }}
          />
          <span style={{ position: "absolute", bottom: -34, left: 0, right: 0, fontFamily: FONT.hand, fontSize: 20, color: C.ink }}>
            tap to slide the band off ↗
          </span>
        </button>
      )}

      {stage === Stage.Ask && (
        <Page style={{ width: "min(360px, 92vw)", padding: "34px 22px 28px 40px", animation: "a-in .5s ease" }}>
          <Rings />
          <div style={{ fontFamily: FONT.marker, fontSize: 14, color: C.soft }}>{EXAMPLE.byline}</div>
          <h1 style={{ fontFamily: FONT.hand, fontSize: 40, lineHeight: 1.05, color: C.ink, margin: "10px 0 18px" }}>{EXAMPLE.question}</h1>
          <Polaroid src={EXAMPLE.picture} caption="it's sunny today" width={170} rotate={-3} style={{ margin: "0 auto 22px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <LabelButton tone="red" onClick={() => setStage(Stage.Pages)}>Yes ✦</LabelButton>
            <LabelButton tone="plain" onClick={() => setStage(Stage.Later)}>maybe later</LabelButton>
          </div>
        </Page>
      )}

      {stage === Stage.Pages && (
        <div style={{ width: "min(360px, 92vw)" }}>
          <Page
            key={page}
            style={{ minHeight: 560, animation: "a-in .45s ease" }}
          >
            <div
              onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
              onTouchEnd={(e) => {
                const start = touchX.current;
                const end = e.changedTouches[0]?.clientX;
                if (start === null || end === undefined) return;
                if (start - end > 40) next();
                if (end - start > 40) prev();
              }}
            >
              <Rings />
              {page === 0 ? (
                <div style={{ padding: "30px 22px 30px 40px" }}>
                  <div style={{ fontFamily: FONT.display, fontSize: 44, lineHeight: 0.95, color: C.olive }}>{EXAMPLE.title}</div>
                  <div style={{ fontFamily: FONT.hand, fontSize: 22, color: C.ink, margin: "6px 0 26px" }}>{EXAMPLE.byline}</div>
                  {EXAMPLE.stops.map((s, i) => (
                    <div key={s.title} style={{ fontFamily: FONT.marker, fontSize: 22, color: C.olive, margin: "8px 0" }}>
                      0{i + 1} {s.title} <span style={{ fontFamily: FONT.hand, fontSize: 18, color: C.soft }}>· {s.time}</span>
                    </div>
                  ))}
                  <Polaroid src={EXAMPLE.picture} caption="our day ✦" width={150} rotate={4} style={{ margin: "26px 0 0 auto" }} />
                </div>
              ) : (
                <Chapter stop={EXAMPLE.stops[page - 1]!} n={page} />
              )}
            </div>
          </Page>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontFamily: FONT.marker, color: C.ink }}>
            <LabelButton tone="plain" onClick={prev}>‹ back</LabelButton>
            <span style={{ fontSize: 14 }}>{page + 1} / {pages}</span>
            <LabelButton tone="ink" onClick={next}>{page + 1 < pages ? "next ›" : "pick a day ›"}</LabelButton>
          </div>
        </div>
      )}

      {stage === Stage.Pick && (
        <Page style={{ width: "min(360px, 92vw)", padding: "34px 22px 30px 40px", animation: "a-in .45s ease" }}>
          <Rings />
          <h2 style={{ fontFamily: FONT.display, fontSize: 34, color: C.olive, margin: "0 0 16px" }}>Which day?</h2>
          {EXAMPLE.days.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDay(d);
                setStage(Stage.Done);
              }}
              style={{ display: "block", width: "100%", margin: "10px 0", padding: "12px", fontFamily: FONT.marker, fontSize: 18, background: "#fff", border: `2px dashed ${C.kraft}`, color: C.ink, cursor: "pointer" }}
            >
              {d}
            </button>
          ))}
        </Page>
      )}

      {(stage === Stage.Done || stage === Stage.Later) && (
        <Page style={{ width: "min(360px, 92vw)", padding: "60px 22px 60px 40px", textAlign: "center", animation: "a-in .45s ease" }}>
          <Rings />
          <Sticker kind="star" size={48} style={{ top: 20, right: 24 }} />
          <div style={{ fontFamily: FONT.display, fontSize: 38, color: stage === Stage.Done ? C.rust : C.olive }}>
            {stage === Stage.Done ? "It's a date!" : "Another time ♡"}
          </div>
          <div style={{ fontFamily: FONT.hand, fontSize: 24, color: C.ink, marginTop: 12 }}>
            {stage === Stage.Done ? `see you ${day} ✦` : "the binder will wait for you"}
          </div>
        </Page>
      )}
    </main>
  );
}
