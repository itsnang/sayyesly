"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

interface Scrap {
  id: number;
  mark: string;
  tint: string;
  left: string;
  fontSize: number;
  rot: number;
  dur: number;
  delay: number;
}

const MARKS = ["♥", "♡", "✓", "✦", "★"];
const TINTS = ["pink", "lav", "plum"];
const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const TIME_SLOTS = ["6:30 pm", "7:00 pm", "7:30 pm", "8:00 pm", "8:30 pm"];

let scrapId = 0;

export default function DatePicker() {
  const [done, setDone] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmHint, setConfirmHint] = useState("pick a date & time above ↑");
  const [confirmInfo, setConfirmInfo] = useState("");
  const [note, setNote] = useState("");
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const rainInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateHint = (date: string | null, time: string | null) => {
    if (date && time) return `${date} at ${time}  —  can't wait! ✦`;
    if (date) return `${date} ✓  —  now pick a time ↓`;
    if (time) return `${time} ✓  —  now pick a date ↑`;
    return "pick a date & time above ↑";
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentMonthName = MONTH_NAMES[currentMonth];
  const todayNum = today.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();

  const handleDayClick = (day: number) => {
    const d = `${currentMonthName} ${day}`;
    setSelectedDate(d);
    setConfirmHint(updateHint(d, selectedTime));
  };

  const handleTimeClick = (t: string) => {
    setSelectedTime(t);
    setConfirmHint(updateHint(selectedDate, t));
  };

  const spawnRain = useCallback(() => {
    const batch: Scrap[] = Array.from({ length: 52 }, () => {
      const dur = 2.8 + Math.random() * 2.4;
      const delay = Math.random() * 0.6;
      return {
        id: ++scrapId,
        mark: MARKS[Math.floor(Math.random() * MARKS.length)],
        tint: TINTS[Math.floor(Math.random() * TINTS.length)],
        left: Math.random() * 100 + "vw",
        fontSize: 20 + Math.random() * 20,
        rot: Math.random() * 500 - 250,
        dur,
        delay,
      };
    });
    setScraps((prev) => [...prev, ...batch]);
    setTimeout(() => {
      setScraps((prev) => prev.filter((s) => !batch.find((b) => b.id === s.id)));
    }, 6200);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedDate || !selectedTime) return;
    setConfirmInfo(`${selectedDate} · ${selectedTime} · mauu steak`);
    setDone(true);
    spawnRain();
    rainInterval.current = setInterval(spawnRain, 1300);
    setTimeout(() => {
      if (rainInterval.current) clearInterval(rainInterval.current);
    }, 5400);

    fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, time: selectedTime, place: "mauu steak", note: note.trim() || null }),
    }).catch(() => {});
  }, [selectedDate, selectedTime, note, spawnRain]);

  useEffect(() => {
    return () => {
      if (rainInterval.current) clearInterval(rainInterval.current);
    };
  }, []);

  const scrapColor = (tint: string) => {
    if (tint === "pink") return "var(--accent)";
    if (tint === "lav") return "var(--accent-2)";
    return "var(--ink)";
  };

  const calCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="wobble">
            <feTurbulence type="fractalNoise" baseFrequency="0.014 0.022" numOctaves={2} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={3} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Falling scraps */}
      {scraps.map((s) => (
        <div
          key={s.id}
          style={{
            position: "fixed",
            top: -30,
            left: s.left,
            fontSize: s.fontSize,
            color: scrapColor(s.tint),
            fontFamily: "var(--hand)",
            zIndex: 45,
            pointerEvents: "none",
            animation: `drop ${s.dur.toFixed(2)}s linear ${s.delay.toFixed(2)}s forwards`,
            ["--rot" as string]: `${s.rot}deg`,
          }}
        >
          {s.mark}
        </div>
      ))}

      {/* Frame 02 — Date Picker */}
      {!done && (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflowY: "auto",
            padding: "50px 30px 70px",
          }}
        >
          <div
            style={{
              position: "relative",
              background: "var(--paper)",
              width: "min(620px, 100%)",
              borderRadius: 14,
              overflow: "hidden",
              animation: "settle .45s cubic-bezier(.2,.9,.3,1.2) both",
              paddingBottom: 52,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "2.4px solid var(--line)",
                borderRadius: 14,
                filter: "url(#wobble)",
                boxShadow: "4px 5px 0 rgba(138,45,92,0.16)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* Photo gallery */}
            <div style={{ width: "100%" }}>
              <div style={{ width: "100%", height: 230, overflow: "hidden", position: "relative" }}>
                <Image
                  src="/pasted-1780505948966-1.png"
                  alt="maw! restaurant exterior"
                  fill
                  style={{ objectFit: "cover", filter: "brightness(.92) contrast(1.06)" }}
                />
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {[
                  { src: "/pasted-1780505892491-0.png", alt: "maw! neon sign", cap: "the vibe ✦" },
                  { src: "/pasted-1780505849218-0.png", alt: "signature steak at maw!", cap: "the steak ✦" },
                ].map(({ src, alt, cap }) => (
                  <div key={cap} style={{ flex: 1, height: 148, overflow: "hidden", position: "relative" }}>
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      style={{ objectFit: "cover", filter: "brightness(.88) contrast(1.08)" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "24px 10px 8px",
                        background: "linear-gradient(transparent, rgba(20,5,15,.55))",
                        fontFamily: "var(--hand)",
                        fontSize: 13,
                        color: "rgba(255,255,255,.9)",
                        textAlign: "center",
                        pointerEvents: "none",
                      }}
                    >
                      {cap}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "0 44px" }}>
              <div style={{ textAlign: "center", margin: "26px 0 0" }}>
                <div
                  style={{
                    fontFamily: "var(--hand)",
                    fontWeight: 700,
                    fontSize: 50,
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  mauu steak
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ink-soft)",
                    marginTop: 5,
                    letterSpacing: ".07em",
                    textTransform: "uppercase",
                  }}
                >
                  steakhouse
                </div>
              </div>

              {/* Calendar */}
              <p style={{ fontFamily: "var(--hand)", fontSize: 17, color: "var(--ink-soft)", margin: "28px 0 10px", textAlign: "center" }}>
                when you&apos;re free?
              </p>
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--hand)", fontSize: 20, color: "var(--ink)" }}>{currentMonthName} {currentYear}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
                {DAYS_OF_WEEK.map((d) => (
                  <div
                    key={d}
                    style={{
                      textAlign: "center",
                      fontSize: 10,
                      color: "var(--ink-faint)",
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      padding: "3px 0 7px",
                      fontFamily: "var(--marker)",
                    }}
                  >
                    {d}
                  </div>
                ))}
                {calCells.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} style={{ aspectRatio: "1" }} />;
                  const isPast = day < todayNum;
                  const isToday = day === todayNum;
                  const isSelected = selectedDate === `${currentMonthName} ${day}`;
                  return (
                    <div
                      key={day}
                      onClick={() => !isPast && handleDayClick(day)}
                      style={{
                        aspectRatio: "1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--hand)",
                        fontSize: 17,
                        color: isSelected ? "#fff" : isPast ? "var(--ink-faint)" : "var(--ink)",
                        borderRadius: 8,
                        cursor: isPast ? "default" : "pointer",
                        background: isSelected ? "var(--accent)" : "transparent",
                        transform: isSelected ? "scale(1.12)" : undefined,
                        boxShadow: isSelected ? "2px 3px 0 rgba(138,45,92,.22)" : undefined,
                        transition: "background .1s, color .1s, transform .12s",
                        position: "relative",
                      }}
                    >
                      {day}
                      {isToday && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: 3,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "var(--accent)",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Time slots */}
              <p style={{ fontFamily: "var(--hand)", fontSize: 17, color: "var(--ink-soft)", margin: "28px 0 10px", textAlign: "center" }}>
                what time?
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                {TIME_SLOTS.map((t) => {
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={t}
                      onClick={() => handleTimeClick(t)}
                      style={{
                        fontFamily: "var(--marker)",
                        cursor: "pointer",
                        background: isSelected ? "var(--accent)" : "var(--paper)",
                        border: "none",
                        padding: "9px 18px",
                        fontSize: 15,
                        color: isSelected ? "#fff" : "var(--ink)",
                        position: "relative",
                        borderRadius: 11,
                        transition: "transform .15s cubic-bezier(.2,.9,.3,1.3)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          border: `2.4px solid ${isSelected ? "var(--accent)" : "var(--line)"}`,
                          borderRadius: 11,
                          filter: "url(#wobble)",
                          boxShadow: "3px 4px 0 rgba(138,45,92,0.14)",
                        }}
                      />
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Optional note */}
              <div style={{ marginTop: 28 }}>
                <p style={{ fontFamily: "var(--hand)", fontSize: 17, color: "var(--ink-soft)", marginBottom: 10, textAlign: "center" }}>
                  anything to add? <span style={{ color: "var(--ink-faint)", fontSize: 14 }}>(optional)</span>
                </p>
                <div style={{ position: "relative" }}>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="// e.g. maybe somewhere else? or just… hi :)"
                    rows={3}
                    style={{
                      width: "100%",
                      fontFamily: "var(--hand)",
                      fontSize: 15,
                      color: "var(--ink)",
                      background: "var(--paper)",
                      border: "none",
                      borderRadius: 11,
                      padding: "12px 16px",
                      resize: "none",
                      outline: "none",
                      lineHeight: 1.6,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      border: "2.4px solid var(--line)",
                      borderRadius: 11,
                      filter: "url(#wobble)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* Confirm */}
              <div style={{ marginTop: 34, textAlign: "center" }}>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedDate || !selectedTime}
                  style={{
                    fontFamily: "var(--marker)",
                    cursor: selectedDate && selectedTime ? "pointer" : "not-allowed",
                    background: "var(--accent)",
                    border: "none",
                    padding: "16px 40px",
                    fontSize: 20,
                    color: "#fff",
                    position: "relative",
                    borderRadius: 11,
                    opacity: selectedDate && selectedTime ? 1 : 0.38,
                    transition: "transform .15s cubic-bezier(.2,.9,.3,1.3)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      border: "2.4px solid var(--accent)",
                      borderRadius: 11,
                      filter: "url(#wobble)",
                      boxShadow: "3px 4px 0 rgba(138,45,92,0.22)",
                    }}
                  />
                  it&apos;s a date! ✦
                </button>
                <div style={{ marginTop: 13, fontSize: 13, color: "var(--ink-soft)", minHeight: 20, fontFamily: "var(--hand)", transition: "opacity .2s" }}>
                  {confirmHint}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Frame 03 — Success */}
      {done && (() => {
        const [datePart, timePart, placePart] = confirmInfo.split(" · ");
        return (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "30px",
              position: "relative",
            }}
          >
            <div style={{ textAlign: "center", width: "min(500px, 100%)" }}>
              {/* Cat image */}
              <Image
                src="/cat-nobg.png"
                alt="celebrating cat"
                width={220}
                height={220}
                style={{
                  width: "min(220px, 55vw)",
                  height: "auto",
                  display: "block",
                  margin: "0 auto",
                  animation: "pop .75s cubic-bezier(.2,.9,.3,1.6) both",
                }}
                priority
              />

              {/* Headline with wobbly underline */}
              <h1
                style={{
                  fontFamily: "var(--hand)",
                  fontWeight: 700,
                  fontSize: "clamp(44px, 9vw, 70px)",
                  lineHeight: 1.1,
                  color: "var(--ink)",
                  marginTop: 14,
                  animation: "settle .5s .12s cubic-bezier(.2,.9,.3,1.2) both",
                  position: "relative",
                }}
              >
                she said{" "}
                <span style={{ position: "relative", whiteSpace: "nowrap", color: "var(--accent)" }}>
                  yes
                  <svg
                    viewBox="0 0 120 16"
                    preserveAspectRatio="none"
                    style={{
                      position: "absolute",
                      left: "-4%",
                      bottom: -14,
                      width: "108%",
                      height: 14,
                      filter: "url(#wobble)",
                    }}
                  >
                    <path
                      d="M3 9 C30 15 60 3 90 9 C103 12 112 10 117 7"
                      fill="none"
                      stroke="#e23a7a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                !
              </h1>

              {/* Reservation block — tinted, no border */}
              <div
                style={{
                  background: "var(--paper-2)",
                  borderRadius: 16,
                  padding: "22px 36px 26px",
                  marginTop: 32,
                  animation: "settle .5s .28s cubic-bezier(.2,.9,.3,1.2) both",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase" as const,
                    letterSpacing: ".14em",
                    color: "var(--ink-faint)",
                    fontFamily: "var(--marker)",
                    marginBottom: 14,
                  }}
                >
                  reservation confirmed ✓
                </div>
                <div
                  style={{
                    fontFamily: "var(--hand)",
                    fontWeight: 700,
                    fontSize: 30,
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {placePart}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                    flexWrap: "wrap" as const,
                  }}
                >
                  <span style={{ fontFamily: "var(--hand)", fontSize: 22, color: "var(--ink)" }}>
                    {datePart}
                  </span>
                  <span style={{ color: "var(--ink-faint)", fontSize: 18 }}>·</span>
                  <span style={{ fontFamily: "var(--hand)", fontSize: 22, color: "var(--ink)" }}>
                    {timePart}
                  </span>
                </div>
                <a
                  href="https://maps.app.goo.gl/2UQ6SB6ctfqXjzBc7"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: 14,
                    fontFamily: "var(--marker)",
                    fontSize: 13,
                    color: "var(--accent)",
                    textDecoration: "none",
                    letterSpacing: ".04em",
                  }}
                >
                  📍 open in maps ↗
                </a>
              </div>

              {/* Her note, if any */}
              {note.trim() && (
                <div
                  style={{
                    background: "var(--paper-2)",
                    borderRadius: 12,
                    padding: "14px 20px",
                    marginTop: 20,
                    animation: "settle .5s .38s cubic-bezier(.2,.9,.3,1.2) both",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".12em", color: "var(--ink-faint)", fontFamily: "var(--marker)", marginBottom: 6 }}>
                    she says
                  </div>
                  <div style={{ fontFamily: "var(--hand)", fontSize: 16, color: "var(--ink)", lineHeight: 1.5 }}>
                    &ldquo;{note.trim()}&rdquo;
                  </div>
                </div>
              )}

              {/* Footer note */}
              <div
                style={{
                  marginTop: 26,
                  fontSize: 14,
                  color: "var(--ink-faint)",
                  fontFamily: "var(--marker)",
                  animation: "settle .5s .44s cubic-bezier(.2,.9,.3,1.2) both",
                }}
              >
                see you soon — i&apos;ll bring the good vibes ✦
              </div>
            </div>

            {/* Margin annotations */}
            <div
              style={{
                position: "fixed",
                fontFamily: "var(--marker)",
                color: "var(--accent)",
                fontSize: 13,
                lineHeight: 1.35,
                pointerEvents: "none",
                zIndex: 7,
                top: "20%",
                right: 28,
                transform: "rotate(2.5deg)",
                textAlign: "right" as const,
              }}
              className="note"
            >
              {"// date confirmed"}
              <br />
              🌷
            </div>
            <div
              style={{
                position: "fixed",
                fontFamily: "var(--marker)",
                color: "var(--accent-2)",
                fontSize: 12,
                lineHeight: 1.35,
                pointerEvents: "none",
                zIndex: 7,
                bottom: "22%",
                left: 28,
                transform: "rotate(-2deg)",
              }}
              className="note"
            >
              {"// table for two"}
              <br />
              jakarta · jun 2026
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes settle {
          from { opacity: 0; transform: translateY(16px) rotate(-.6deg); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes pop {
          from { transform: scale(0) rotate(-30deg); opacity: 0; }
          to   { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes drop {
          to { transform: translateY(116vh) rotate(var(--rot, 200deg)); }
        }
      `}</style>
    </>
  );
}
