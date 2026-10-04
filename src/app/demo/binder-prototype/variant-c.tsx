"use client";

// PROTOTYPE variant C: "One long scrapbook". No pages to turn: a single grid-paper sheet
// you scroll, rings down the left edge, the Stops as taped collages threaded on a dotted
// route. The question is a taped note at the top and the answer bar stays in reach the
// whole way down. Tests whether paging is worth it at all.
import { useEffect, useState } from "react";
import { EXAMPLE } from "./example";
import { C, Elastic, FONT, GRID_BG, LabelButton, Polaroid, Rings, Sticker, Tape, TimeTag } from "./pieces";

export function VariantC({ report }: { report: (state: string) => void }) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [seen, setSeen] = useState(0);

  useEffect(() => {
    report(`stops-scrolled-past=${seen}/${EXAMPLE.stops.length}${picking ? " picking-day" : ""}${answer ? ` answer=${answer}` : ""}`);
  }, [seen, picking, answer, report]);

  useEffect(() => {
    const onScroll = () => {
      const blocks = document.querySelectorAll("[data-stop]");
      let count = 0;
      blocks.forEach((b) => {
        if (b.getBoundingClientRect().top < window.innerHeight * 0.6) count += 1;
      });
      setSeen(count);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main style={{ minHeight: "100dvh", background: GRID_BG, position: "relative", padding: "80px 20px 220px 44px", overflowX: "hidden" }}>
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 26, background: C.board, zIndex: 4 }}>
        <Rings style={{ left: 2 }} />
      </div>
      <Elastic style={{ position: "fixed", right: 22, top: 0, bottom: 0 }} />

      {/* the question, taped at the top */}
      <section style={{ position: "relative", background: "#fffbea", padding: "26px 18px 20px", marginRight: 18, transform: "rotate(-1.5deg)", boxShadow: "0 3px 8px rgba(0,0,0,.12)" }}>
        <Tape tone="pink" style={{ top: -10, left: 24, transform: "rotate(-5deg)" }} />
        <Tape tone="pink" style={{ top: -10, right: 24, transform: "rotate(6deg)" }} />
        <div style={{ fontFamily: FONT.display, fontSize: 34, lineHeight: 0.95, color: C.olive }}>{EXAMPLE.title}</div>
        <div style={{ fontFamily: FONT.hand, fontSize: 20, color: C.soft }}>{EXAMPLE.byline}</div>
        <h1 style={{ fontFamily: FONT.hand, fontSize: 36, lineHeight: 1.05, color: C.ink, margin: "12px 0 6px" }}>{EXAMPLE.question}</h1>
        <div style={{ fontFamily: FONT.marker, fontSize: 14, color: C.rust }}>scroll for the plan ↓</div>
      </section>

      {/* the route */}
      <div style={{ position: "relative", marginTop: 36, paddingLeft: 30 }}>
        <span aria-hidden style={{ position: "absolute", left: 11, top: 10, bottom: 10, borderLeft: `3px dotted ${C.kraft}` }} />
        {EXAMPLE.stops.map((stop, i) => (
          <section key={stop.title} data-stop style={{ position: "relative", marginBottom: 54 }}>
            <span
              aria-hidden
              style={{ position: "absolute", left: -32, top: 2, width: 28, height: 28, borderRadius: 28, background: C.olive, color: "#fff", fontFamily: FONT.marker, fontSize: 14, display: "grid", placeItems: "center" }}
            >
              {i + 1}
            </span>
            <TimeTag>{stop.time}</TimeTag>
            <div style={{ fontFamily: FONT.display, fontSize: 30, color: C.olive, lineHeight: 1, marginTop: 6 }}>{stop.title}</div>
            <div style={{ fontFamily: FONT.hand, fontSize: 24, color: C.rust, transform: "rotate(-2deg)" }}>{stop.subtitle}</div>
            <div style={{ position: "relative", height: stop.photos.length > 2 ? 230 : 190, margin: "12px 0" }}>
              {stop.photos.map((p, j) => (
                <Polaroid
                  key={j}
                  src={p.url}
                  caption={p.caption}
                  width={128}
                  rotate={[-6, 5, -2][j] ?? 0}
                  tape={(["grid", "sage", "beige"] as const)[j] ?? "beige"}
                  style={{ position: "absolute", left: [0, 110, 50][j] ?? 0, top: [0, 22, 70][j] ?? 0, zIndex: j }}
                />
              ))}
              {i === 0 && <Sticker kind="star" style={{ right: 26, top: 6 }} />}
              {i === 2 && <Sticker kind="sun" size={44} style={{ right: 20, top: 0 }} />}
            </div>
            <p style={{ fontFamily: FONT.note, fontSize: 14, lineHeight: 1.55, color: C.ink, margin: "0 18px 4px 0" }}>{stop.description}</p>
            <p style={{ fontFamily: FONT.hand, fontSize: 19, color: C.soft, margin: 0 }}>📍 {stop.place} · <span style={{ textDecoration: "underline" }}>map</span></p>
          </section>
        ))}
        <div style={{ fontFamily: FONT.hand, fontSize: 26, color: C.ink }}>…and then I walk you home ♡</div>
      </div>

      {/* always-in-reach answer bar */}
      <div
        style={{
          position: "fixed",
          left: 34,
          right: 40,
          bottom: 70,
          padding: "12px 14px",
          background: C.paper,
          boxShadow: "0 6px 18px rgba(0,0,0,.18)",
          transform: "rotate(-.6deg)",
          zIndex: 6,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Tape tone="grid" width={60} style={{ top: -10, left: "50%", marginLeft: -30 }} />
        {answer ? (
          <span style={{ fontFamily: FONT.display, fontSize: 24, color: C.rust }}>{answer === "later" ? "Another time ♡" : `It's a date! ${answer}`}</span>
        ) : picking ? (
          EXAMPLE.days.map((d) => (
            <button key={d} type="button" onClick={() => setAnswer(d)} style={{ padding: "8px 10px", fontFamily: FONT.marker, fontSize: 14, background: C.sage, color: "#fff", border: 0, cursor: "pointer" }}>
              {d}
            </button>
          ))
        ) : (
          <>
            <LabelButton tone="red" onClick={() => setPicking(true)}>Yes ✦</LabelButton>
            <LabelButton tone="plain" onClick={() => setAnswer("later")}>maybe later</LabelButton>
          </>
        )}
      </div>
    </main>
  );
}
