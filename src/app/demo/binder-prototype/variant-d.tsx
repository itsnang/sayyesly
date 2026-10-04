"use client";

// PROTOTYPE variant D: "Dear diary". After the WOB-diary reference: a journal spread
// with a printed header row, a pen-written letter that tells the day Stop by Stop, ticket
// stubs, a highlighter circle and a stamp badge, the right page torn grid paper. Up front:
// the question is the letter's P.S., answered with "admit one" tickets.
import { useEffect, useState } from "react";
import { EXAMPLE } from "./example";
import { C, FONT, GRID_BG, Polaroid, Tape } from "./pieces";

const CREAM = "#f7f4ec";
const LINE = "rgba(40,40,40,.12)";

export function VariantD({ report }: { report: (state: string) => void }) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    report(`${picking ? "picking-day " : ""}${answer ? `answer=${answer}` : "reading the letter"}`);
  }, [picking, answer, report]);

  return (
    <main style={{ minHeight: "100dvh", background: "#e8dfd2", padding: "74px 12px 40px" }}>
      <div style={{ maxWidth: 420, margin: "0 auto", background: CREAM, borderRadius: 18, boxShadow: "0 12px 30px rgba(0,0,0,.18)", overflow: "hidden" }}>
        {/* printed header row */}
        <header style={{ display: "flex", justifyContent: "space-between", padding: "16px 18px 10px", fontFamily: "ui-sans-serif, system-ui", fontWeight: 700, fontSize: 11, letterSpacing: 0.8, color: C.ink, textTransform: "uppercase" }}>
          <span>October ’26</span>
          <span>our diary</span>
          <span>@dara</span>
        </header>

        <section style={{ position: "relative", padding: "8px 20px 24px" }}>
          <StarStamp />
          <p style={{ fontFamily: FONT.note, fontSize: 17, color: C.ink, margin: "70px 0 10px" }}>Dear you,</p>
          <p style={{ fontFamily: FONT.note, fontSize: 15, lineHeight: 1.6, color: C.ink, margin: "0 0 0 18px" }}>
            I planned us a whole day. It goes like this…
          </p>

          {EXAMPLE.stops.map((stop, i) => (
            <div key={stop.title} style={{ position: "relative", borderTop: `1px solid ${LINE}`, marginTop: 22, paddingTop: 18 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <p style={{ flex: 1, fontFamily: FONT.note, fontSize: 15, lineHeight: 1.6, color: C.ink, margin: 0 }}>
                  {i === 0 ? "First, " : i === EXAMPLE.stops.length - 1 ? "And then… " : "After that, "}
                  <Circled>{stop.subtitle}</Circled> at {stop.place}. {stop.description}
                </p>
                {stop.photos[0] && <Polaroid src={stop.photos[0].url} width={96} rotate={i % 2 ? 4 : -4} tape={i % 2 ? "grid" : "beige"} />}
              </div>
              <Ticket n={i + 1} title={stop.title} time={stop.time} />
            </div>
          ))}
        </section>

        {/* right page: torn grid paper with the P.S. */}
        <section
          style={{
            position: "relative",
            background: GRID_BG,
            padding: "34px 22px 34px",
            clipPath: "polygon(0 2%, 6% 0, 14% 1.6%, 24% .3%, 33% 1.8%, 45% .4%, 57% 1.7%, 68% .2%, 79% 1.5%, 90% .3%, 100% 1.4%, 100% 100%, 0 100%)",
          }}
        >
          <Tape tone="grid" width={110} style={{ top: 18, left: 30, transform: "rotate(-3deg)" }} />
          <p style={{ fontFamily: FONT.note, fontSize: 16, lineHeight: 1.6, color: C.ink, margin: "26px 0 6px" }}>P.S.</p>
          <h1 style={{ fontFamily: FONT.note, fontSize: 24, lineHeight: 1.35, color: C.ink, margin: "0 0 4px", fontWeight: 400 }}>{EXAMPLE.question}</h1>
          <svg width="40" height="70" viewBox="0 0 40 70" aria-hidden style={{ display: "block", margin: "6px 0 10px 40px" }}>
            <path d="M20 4c-2 18 3 34-1 58M10 52l9 12 10-13" fill="none" stroke={C.ink} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {answer ? (
            <p style={{ fontFamily: FONT.hand, fontSize: 36, fontWeight: 700, color: C.brown, margin: 0 }}>{answer === "later" ? "another time ♡" : `it's a date! ${answer}`}</p>
          ) : picking ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {EXAMPLE.days.map((d) => (
                <AdmitOne key={d} onClick={() => setAnswer(d)} label={d} small="pick this day" />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <AdmitOne onClick={() => setPicking(true)} label="Yes!" small="admit one" />
              <button type="button" onClick={() => setAnswer("later")} style={{ fontFamily: FONT.note, fontSize: 15, color: C.soft, background: "none", border: 0, textDecoration: "underline", cursor: "pointer" }}>
                maybe later
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/** A word circled with a yellow highlighter. */
function Circled({ children }: { children: string }) {
  return (
    <span style={{ position: "relative", whiteSpace: "nowrap", padding: "0 4px" }}>
      {children}
      <svg aria-hidden viewBox="0 0 100 30" preserveAspectRatio="none" style={{ position: "absolute", inset: "-6px -6px", width: "calc(100% + 12px)", height: "calc(100% + 12px)" }}>
        <path d="M6 16C8 4 90 2 96 13c4 9-40 15-78 13C4 25 2 18 12 10" fill="none" stroke="#e8b73a" strokeWidth="1.8" />
      </svg>
    </span>
  );
}

/** A printed ticket stub for one Stop, like the "Pop up print fair" sticker. */
function Ticket({ n, title, time }: { n: number; title: string; time: string }) {
  return (
    <div
      style={{
        display: "inline-block",
        marginTop: 14,
        padding: "8px 16px",
        background: "#fffdf7",
        border: `2px solid ${C.ink}`,
        boxShadow: `3px 3px 0 ${C.ink}`,
        transform: `rotate(${n % 2 ? -2 : 2}deg)`,
        color: C.ink,
      }}
    >
      <div style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 18, letterSpacing: -0.5, textTransform: "uppercase", lineHeight: 1 }}>chapter {n}</div>
      <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 24, lineHeight: 1.1 }}>{title}.</div>
      <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 12, fontWeight: 700 }}>{time}</div>
    </div>
  );
}

/** An "admit one" ticket used as an answer button. */
function AdmitOne({ label, small, onClick }: { label: string; small: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "relative",
        padding: "10px 22px",
        background: C.accent,
        color: "#fff",
        border: 0,
        cursor: "pointer",
        textAlign: "left",
        transform: "rotate(-2deg)",
        // notched ticket ends
        clipPath: "polygon(0 0, 100% 0, 100% 35%, 94% 50%, 100% 65%, 100% 100%, 0 100%, 0 65%, 6% 50%, 0 35%)",
      }}
    >
      <div style={{ fontFamily: FONT.typed, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", opacity: 0.85 }}>{small}</div>
      <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 22, lineHeight: 1 }}>{label}</div>
    </button>
  );
}

/** The round stamp badge from the reference, with a star. */
function StarStamp() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" aria-hidden style={{ position: "absolute", top: 4, left: 18 }}>
      <path d="M30 6l7 20 21 1-17 12 6 21-17-12-17 12 6-21L2 27l21-1z" fill="none" stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="84" cy="38" r="26" fill="#fff" stroke={C.ink} strokeWidth="2" />
      <circle cx="84" cy="38" r="17" fill="none" stroke={C.ink} strokeWidth="1" />
      <path d="M84 30l2 6 6 0-5 4 2 6-5-4-5 4 2-6-5-4 6 0z" fill={C.ink} />
      <text x="84" y="16" textAnchor="middle" fontSize="6" fontFamily="ui-sans-serif" fontWeight="700" fill={C.ink}>JUST FOR YOU</text>
    </svg>
  );
}
