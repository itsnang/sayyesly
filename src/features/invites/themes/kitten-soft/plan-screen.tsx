"use client";

import { useState } from "react";
import Image from "next/image";
import type { PublicInvite } from "../../types";
import { NOTE_MAX_LENGTH } from "../../utils/answer";
import { isOptimizable } from "@/lib/media";
import { formatInZone, PillButton, Prompt, WobbleFilter, WobblyBorder } from "./shared";

const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const TIME_CHIPS: [label: string, value: string][] = [
  ["6:30 pm", "18:30"],
  ["7:00 pm", "19:00"],
  ["7:30 pm", "19:30"],
  ["8:00 pm", "20:00"],
  ["8:30 pm", "20:30"],
];
/** How many months ahead the Recipient can page the calendar. */
const MONTHS_AHEAD = 2;

export type PlanChoice =
  | { kind: "slot"; timeSlotId: string }
  | { kind: "custom"; date: string; time: string };

type Selection = { slotId: string | null; date: string | null; time: string | null };

/** Today's year, month (0-based) and day in the Invite's time zone, not the viewer's. */
function todayIn(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month") - 1, day: get("day") };
}

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function dateLabel(iso: string) {
  const [, m, d] = iso.split("-").map(Number) as [number, number, number];
  return `${MONTH_NAMES[m - 1]} ${d}`;
}

function timeLabel(value: string) {
  const [h, m] = value.split(":").map(Number) as [number, number];
  return `${h % 12 || 12}:${pad(m)} ${h < 12 ? "am" : "pm"}`;
}

type PlanScreenProps = {
  invite: PublicInvite;
  busy: boolean;
  error: string | null;
  onConfirm: (choice: PlanChoice, note: string) => void;
};

export function PlanScreen({ invite, busy, error, onConfirm }: PlanScreenProps) {
  const { plan } = invite;
  const [heroPhoto, ...otherPhotos] = plan.photos;
  const [sel, setSel] = useState<Selection>({ slotId: null, date: null, time: null });
  const [otherTime, setOtherTime] = useState("");
  const [note, setNote] = useState("");

  const today = todayIn(invite.timezone);
  const [monthOffset, setMonthOffset] = useState(0);
  const viewMonth = (today.month + monthOffset) % 12;
  const viewYear = today.year + Math.floor((today.month + monthOffset) / 12);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const todayIso = isoDate(today.year, today.month, today.day);

  const slot = invite.timeSlots.find((s) => s.id === sel.slotId);
  const slotText = slot ? formatInZone(slot.startsAt, invite.timezone) : null;

  const choice: PlanChoice | null = sel.slotId
    ? { kind: "slot", timeSlotId: sel.slotId }
    : sel.date && sel.time
      ? { kind: "custom", date: sel.date, time: sel.time }
      : null;

  const hint = (() => {
    if (error) return `// ${error}`;
    if (slotText) return `${slotText.date} at ${slotText.time}  —  can't wait! ✦`;
    if (sel.date && sel.time) return `${dateLabel(sel.date)} at ${timeLabel(sel.time)}  —  can't wait! ✦`;
    if (sel.date) return `${dateLabel(sel.date)} ✓  —  now pick a time ↓`;
    if (sel.time) return `${timeLabel(sel.time)} ✓  —  now pick a date ↑`;
    return invite.timeSlots.length > 0 ? "pick a time above ↑" : "pick a date & time above ↑";
  })();

  const calCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const navButton = (label: string, delta: number, enabled: boolean) => (
    <button
      type="button"
      aria-label={delta < 0 ? "previous month" : "next month"}
      onClick={() => setMonthOffset((o) => o + delta)}
      disabled={!enabled}
      style={{
        background: "none",
        border: "none",
        fontFamily: "var(--hand)",
        fontSize: 22,
        color: enabled ? "var(--ink)" : "var(--ink-faint)",
        cursor: enabled ? "pointer" : "default",
        padding: "0 12px",
        visibility: enabled ? "visible" : "hidden",
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <WobbleFilter />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "50px 16px 70px",
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
          {heroPhoto && (
            <div style={{ width: "100%" }}>
              <div style={{ width: "100%", height: 230, overflow: "hidden", position: "relative" }}>
                <Image
                  src={heroPhoto.url}
                  unoptimized={!isOptimizable(heroPhoto.url)}
                  alt={heroPhoto.alt}
                  fill
                  sizes="(max-width: 620px) 100vw, 620px"
                  style={{ objectFit: "cover", filter: "brightness(.92) contrast(1.06)" }}
                />
              </div>
              {otherPhotos.length > 0 && (
                <div style={{ display: "flex", gap: 2 }}>
                  {otherPhotos.map(({ url, alt, caption }) => (
                    <div key={url} style={{ flex: 1, height: 148, overflow: "hidden", position: "relative" }}>
                      <Image
                        src={url}
                        unoptimized={!isOptimizable(url)}
                        alt={alt}
                        fill
                        sizes="(max-width: 620px) 50vw, 310px"
                        style={{ objectFit: "cover", filter: "brightness(.88) contrast(1.08)" }}
                      />
                      {caption && (
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
                          {caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Body */}
          <div style={{ padding: "0 clamp(18px, 7vw, 44px)" }}>
            <div style={{ textAlign: "center", margin: "26px 0 0" }}>
              {plan.place && (
                <div style={{ fontFamily: "var(--hand)", fontWeight: 700, fontSize: 50, color: "var(--accent)", lineHeight: 1 }}>
                  {plan.place}
                </div>
              )}
              {plan.activity && (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ink-soft)",
                    marginTop: 5,
                    letterSpacing: ".07em",
                    textTransform: "uppercase",
                  }}
                >
                  {plan.activity}
                </div>
              )}
              {(plan.dressCode || plan.notes) && (
                <div style={{ marginTop: 14, fontFamily: "var(--hand)", fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.4 }}>
                  {plan.dressCode && <div>dress code: {plan.dressCode}</div>}
                  {plan.notes && <div style={{ whiteSpace: "pre-line" }}>{plan.notes}</div>}
                </div>
              )}
            </div>

            {/* Time slots offered by the Creator */}
            {invite.timeSlots.length > 0 && (
              <>
                <Prompt>which one works?</Prompt>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  {invite.timeSlots.map((s) => {
                    const { date, time, weekday } = formatInZone(s.startsAt, invite.timezone);
                    return (
                      <PillButton
                        key={s.id}
                        selected={sel.slotId === s.id}
                        onClick={() => setSel({ slotId: s.id, date: null, time: null })}
                      >
                        {weekday} {date} · {time}
                      </PillButton>
                    );
                  })}
                </div>
              </>
            )}

            {invite.allowCustomTime && (
              <>
                {/* Calendar */}
                <Prompt>{invite.timeSlots.length > 0 ? "or another day?" : <>when you&apos;re free?</>}</Prompt>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  {navButton("‹", -1, monthOffset > 0)}
                  <span style={{ fontFamily: "var(--hand)", fontSize: 20, color: "var(--ink)", minWidth: 150, textAlign: "center" }}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </span>
                  {navButton("›", 1, monthOffset < MONTHS_AHEAD)}
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
                    const iso = isoDate(viewYear, viewMonth, day);
                    const isPast = iso < todayIso;
                    const isToday = iso === todayIso;
                    const isSelected = sel.date === iso;
                    return (
                      <button
                        type="button"
                        key={iso}
                        disabled={isPast}
                        aria-pressed={isSelected}
                        aria-label={dateLabel(iso)}
                        onClick={() => setSel((prev) => ({ slotId: null, date: iso, time: prev.slotId ? null : prev.time }))}
                        style={{
                          aspectRatio: "1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--hand)",
                          fontSize: 17,
                          color: isSelected ? "#fff" : isPast ? "var(--ink-faint)" : "var(--ink)",
                          borderRadius: 8,
                          border: "none",
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
                      </button>
                    );
                  })}
                </div>

                {/* Times */}
                <Prompt>what time?</Prompt>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  {TIME_CHIPS.map(([label, value]) => (
                    <PillButton
                      key={value}
                      selected={!sel.slotId && sel.time === value}
                      onClick={() => {
                        setOtherTime("");
                        setSel((prev) => ({ slotId: null, date: prev.slotId ? null : prev.date, time: value }));
                      }}
                    >
                      {label}
                    </PillButton>
                  ))}
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    marginTop: 14,
                    fontFamily: "var(--hand)",
                    fontSize: 16,
                    color: "var(--ink-soft)",
                  }}
                >
                  or another time:
                  <input
                    type="time"
                    value={otherTime}
                    onChange={(e) => {
                      setOtherTime(e.target.value);
                      const value = e.target.value;
                      setSel((prev) => ({ slotId: null, date: prev.slotId ? null : prev.date, time: value || null }));
                    }}
                    style={{
                      fontFamily: "var(--marker)",
                      fontSize: 15,
                      color: "var(--ink)",
                      background: "var(--paper)",
                      border: "2px solid var(--line)",
                      borderRadius: 9,
                      padding: "6px 10px",
                    }}
                  />
                </label>
              </>
            )}

            {/* Optional note */}
            <div style={{ marginTop: 28 }}>
              <p style={{ fontFamily: "var(--hand)", fontSize: 17, color: "var(--ink-soft)", marginBottom: 10, textAlign: "center" }}>
                anything to add? <span style={{ color: "var(--ink-faint)", fontSize: 14 }}>(optional)</span>
              </p>
              <div style={{ position: "relative" }}>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={NOTE_MAX_LENGTH}
                  placeholder="// e.g. maybe somewhere else? or just… hi :)"
                  rows={3}
                  style={{
                    width: "100%",
                    fontFamily: "var(--hand)",
                    fontSize: 16,
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
                <WobblyBorder shadow="none" />
              </div>
            </div>

            {/* Confirm */}
            <div style={{ marginTop: 34, textAlign: "center" }}>
              <button
                type="button"
                onClick={() => choice && onConfirm(choice, note)}
                disabled={!choice || busy}
                style={{
                  fontFamily: "var(--marker)",
                  cursor: choice && !busy ? "pointer" : "not-allowed",
                  background: "var(--accent)",
                  border: "none",
                  padding: "16px 40px",
                  fontSize: 20,
                  color: "#fff",
                  position: "relative",
                  borderRadius: 11,
                  opacity: choice && !busy ? 1 : 0.38,
                  transition: "transform .15s cubic-bezier(.2,.9,.3,1.3)",
                }}
              >
                <WobblyBorder color="var(--accent)" shadow="3px 4px 0 rgba(138,45,92,0.22)" />
                {busy ? "saving…" : "let's eat! ✦"}
              </button>
              <div
                aria-live="polite"
                style={{
                  marginTop: 13,
                  fontSize: 13,
                  color: error ? "var(--accent)" : "var(--ink-soft)",
                  minHeight: 20,
                  fontFamily: "var(--hand)",
                }}
              >
                {hint}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
