"use client";

// PROTOTYPE variant E: "Spiral photo notebook". After the Food & Drinks reference: a
// spiral-bound page, a blue script title, typewriter captions, polaroids with date
// stamps, a bow doodle. Photo-first: the first page is the question plus one polaroid
// per Stop; tapping a polaroid opens that Stop's page, and back returns to the question.
import { useEffect, useState } from "react";
import Image from "next/image";
import type { ExampleStop } from "./example";
import { EXAMPLE } from "./example";
import { C, FONT, Tape } from "./pieces";

const BLUE = "#2f5fd0";
const PAPER = "#f6f4ef";

export function VariantE({ report }: { report: (state: string) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    report(`${open === null ? "page=question" : `page=stop ${open + 1}`}${picking ? " picking-day" : ""}${answer ? ` answer=${answer}` : ""}`);
  }, [open, picking, answer, report]);

  const stop = open === null ? null : EXAMPLE.stops[open];

  return (
    <main style={{ minHeight: "100dvh", background: "linear-gradient(160deg, #6f747a, #3b3f44)", padding: "72px 14px 40px" }}>
      <div style={{ position: "relative", maxWidth: 400, margin: "0 auto", background: PAPER, borderRadius: "4px 16px 16px 4px", padding: "26px 20px 34px 40px", boxShadow: "0 14px 34px rgba(0,0,0,.35)", minHeight: 640 }}>
        <Spiral />
        {stop ? (
          <StopPage stop={stop} n={(open ?? 0) + 1} onBack={() => setOpen(null)} />
        ) : (
          <>
            <h1 style={{ fontFamily: FONT.hand, fontWeight: 700, fontSize: 50, lineHeight: 0.9, color: BLUE, margin: 0, transform: "rotate(-4deg)" }}>
              {EXAMPLE.title}
            </h1>
            <p style={{ fontFamily: FONT.typed, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: C.ink, margin: "18px 0 8px" }}>
              {EXAMPLE.question}
            </p>
            <Answer answer={answer} picking={picking} onYes={() => setPicking(true)} onLater={() => setAnswer("later")} onDay={setAnswer} />

            <p style={{ fontFamily: FONT.typed, fontSize: 11, color: C.soft, margin: "22px 0 6px" }}>tap a photo to open its chapter ↓</p>
            <div style={{ position: "relative", height: 330 }}>
              {EXAMPLE.stops.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Open chapter ${i + 1}: ${s.title}`}
                  style={{ position: "absolute", left: ["0%", "46%", "18%"][i], top: [0, 40, 168][i], border: 0, padding: 0, background: "none", cursor: "pointer", zIndex: i }}
                >
                  <Snap src={s.photos[0]?.url ?? EXAMPLE.picture} stamp={`18/10 · ${s.time}`} rotate={[-3, 4, -1][i] ?? 0} label={s.title} />
                </button>
              ))}
            </div>
          </>
        )}
        <Bow />
      </div>
    </main>
  );
}

function StopPage({ stop, n, onBack }: { stop: ExampleStop; n: number; onBack: () => void }) {
  return (
    <div>
      <button type="button" onClick={onBack} style={{ fontFamily: FONT.typed, fontSize: 12, color: C.soft, background: "none", border: 0, padding: 0, cursor: "pointer", textDecoration: "underline" }}>
        ‹ back to the question
      </button>
      <div style={{ fontFamily: FONT.typed, fontSize: 11, letterSpacing: 1, color: C.soft, marginTop: 14 }}>CHAPTER 0{n} · {stop.time.toUpperCase()}</div>
      <h2 style={{ fontFamily: FONT.hand, fontWeight: 700, fontSize: 52, lineHeight: 0.9, color: BLUE, margin: "4px 0 0", transform: "rotate(-4deg)" }}>{stop.subtitle}</h2>
      <p style={{ fontFamily: FONT.typed, fontSize: 13, lineHeight: 1.5, textTransform: "uppercase", color: C.ink, margin: "18px 0 6px" }}>{stop.description}</p>
      <p style={{ fontFamily: FONT.typed, fontSize: 12, color: BLUE, margin: 0 }}>@ {stop.place} → map</p>
      <div style={{ position: "relative", height: stop.photos.length > 2 ? 360 : 260, marginTop: 16 }}>
        {/* a scrap of old letter paper behind the photos */}
        <div aria-hidden style={{ position: "absolute", left: "30%", top: 90, width: 130, height: 150, background: "repeating-linear-gradient(0deg, #ece6da 0 18px, #e4dccc 18px 19px)", transform: "rotate(3deg)", fontFamily: FONT.hand, fontSize: 13, color: "#8d8476", padding: 8, overflow: "hidden" }}>
          tanto gli amici, e la puntata dalla parte del cuore…
        </div>
        {stop.photos.map((p, i) => (
          <div key={i} style={{ position: "absolute", left: ["0%", "44%", "8%"][i], top: [0, 50, 170][i], zIndex: i + 1 }}>
            <Snap src={p.url} stamp={`18/10/26`} rotate={[-2, 5, -4][i] ?? 0} label={p.caption} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Answer({ answer, picking, onYes, onLater, onDay }: { answer: string | null; picking: boolean; onYes: () => void; onLater: () => void; onDay: (d: string) => void }) {
  if (answer) return <p style={{ fontFamily: FONT.hand, fontSize: 34, fontWeight: 700, color: BLUE, margin: 0 }}>{answer === "later" ? "another time ♡" : `it's a date! ${answer}`}</p>;
  const box = { fontFamily: FONT.typed, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" as const, padding: "8px 12px", background: "#fff", border: `1.5px solid ${C.ink}`, color: C.ink, cursor: "pointer" };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {picking ? (
        EXAMPLE.days.map((d) => (
          <button key={d} type="button" onClick={() => onDay(d)} style={box}>
            {d}
          </button>
        ))
      ) : (
        <>
          <button type="button" onClick={onYes} style={{ ...box, background: BLUE, color: "#fff", borderColor: BLUE }}>
            yes ✦
          </button>
          <button type="button" onClick={onLater} style={{ ...box, border: 0, background: "none", textDecoration: "underline" }}>
            maybe later
          </button>
        </>
      )}
    </div>
  );
}

/** A photo print with a date stamp under it, taped at the top. */
function Snap({ src, stamp, rotate, label }: { src: string; stamp: string; rotate: number; label?: string }) {
  return (
    <figure style={{ position: "relative", width: 160, margin: 0, padding: "8px 8px 6px", background: "#fdfdfb", boxShadow: "0 4px 12px rgba(0,0,0,.18)", transform: `rotate(${rotate}deg)` }}>
      <Tape tone="grid" width={44} style={{ top: -10, left: 58 }} />
      <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", overflow: "hidden" }}>
        <Image src={src} alt="" fill sizes="160px" style={{ objectFit: "cover" }} />
      </div>
      <figcaption style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.typed, fontSize: 9, color: C.ink, paddingTop: 4 }}>
        <span>{stamp}</span>
        {label ? <span style={{ color: BLUE }}>{label}</span> : null}
      </figcaption>
    </figure>
  );
}

/** Spiral binding down the left edge. */
function Spiral() {
  return (
    <div aria-hidden style={{ position: "absolute", left: -12, top: 16, bottom: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {Array.from({ length: 24 }, (_, i) => (
        <svg key={i} width="34" height="12" viewBox="0 0 34 12">
          <path d="M2 8c4-8 22-8 30-2" fill="none" stroke="#2a2a2a" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="27" cy="7" r="2.2" fill="#3b3f44" />
        </svg>
      ))}
    </div>
  );
}

/** The little blue bow doodle. */
function Bow() {
  return (
    <svg width="64" height="70" viewBox="0 0 64 70" aria-hidden style={{ position: "absolute", right: 22, bottom: 18 }}>
      <path d="M32 26c-10-16-28-10-22 2 5 9 22 0 22-2zm0 0c10-16 28-10 22 2-5 9-22 0-22-2zm0 0c-4 14-10 28-18 38m18-38c3 15 8 28 18 36" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
