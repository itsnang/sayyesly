"use client";

import { useState } from "react";
import Image from "next/image";
import type { PublicInvite } from "../../types";
import { NOTE_MAX_LENGTH } from "../../utils/answer";
import { timesFor } from "../../utils/time-of-day";
import { MONTHS, timeLabel as sharedTimeLabel } from "../shared/format";
import type { PlanChoice } from "../../hooks/use-invite-answer";
import { isoDate, usePlanSelection } from "../shared/use-plan-selection";
import { isOptimizable } from "@/lib/media";
import { formatInZone, PillButton, Prompt, WobbleFilter, WobblyBorder } from "./shared";

const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const monthName = (m: number) => MONTHS[m]?.toLowerCase() ?? "";
const timeLabel = (value: string) => sharedTimeLabel(value).toLowerCase();

function dateLabel(iso: string) {
  const [, m = 1, d] = iso.split("-").map(Number);
  return `${monthName(m - 1)} ${d}`;
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
  const selection = usePlanSelection(invite);
  const { calendar, choice } = selection;
  const [otherTime, setOtherTime] = useState("");
  const [note, setNote] = useState("");

  const slotText = selection.slot ? formatInZone(selection.slot.startsAt, invite.timezone) : null;

  const hint = (() => {
    if (error) return `// ${error}`;
    if (slotText) return `${slotText.date} at ${slotText.time}  —  can't wait! ✦`;
    if (selection.date && selection.time) return `${dateLabel(selection.date)} at ${timeLabel(selection.time)}  —  can't wait! ✦`;
    if (selection.date) return `${dateLabel(selection.date)} ✓  —  now pick a time ↓`;
    if (selection.time) return `${timeLabel(selection.time)} ✓  —  now pick a date ↑`;
    return invite.timeSlots.length > 0 ? "pick a time above ↑" : "pick a date & time above ↑";
  })();

  const navButton = (label: string, delta: number, enabled: boolean) => (
    <button
      type="button"
      aria-label={delta < 0 ? "previous month" : "next month"}
      onClick={() => calendar.page(delta)}
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
                      <PillButton key={s.id} selected={selection.slotId === s.id} onClick={() => selection.pickSlot(s.id)}>
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
                  {navButton("‹", -1, calendar.canGoBack)}
                  <span style={{ fontFamily: "var(--hand)", fontSize: 20, color: "var(--ink)", minWidth: 150, textAlign: "center" }}>
                    {monthName(calendar.month)} {calendar.year}
                  </span>
                  {navButton("›", 1, calendar.canGoForward)}
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
                  {calendar.cells.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} style={{ aspectRatio: "1" }} />;
                    const iso = isoDate(calendar.year, calendar.month, day);
                    const isPast = iso < calendar.todayIso;
                    const isToday = iso === calendar.todayIso;
                    const isSelected = selection.date === iso;
                    return (
                      <button
                        type="button"
                        key={iso}
                        disabled={isPast}
                        aria-pressed={isSelected}
                        aria-label={dateLabel(iso)}
                        onClick={() => selection.pickDate(iso)}
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
                  {timesFor(invite.timeOfDay).map((value) => (
                    <PillButton
                      key={value}
                      selected={!selection.slotId && selection.time === value}
                      onClick={() => {
                        setOtherTime("");
                        selection.pickTime(value);
                      }}
                    >
                      {timeLabel(value)}
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
                      selection.pickTime(e.target.value || null);
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
