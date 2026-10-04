"use client";

import { useId, type ReactNode } from "react";
import type { PublicInvite } from "../../types";
import { NOTE_MAX_LENGTH } from "../../utils/answer";
import { timesFor } from "../../utils/time-of-day";
import { formatInZone, MONTHS, parseIsoDate, timeLabel, WEEKDAYS } from "../shared/format";
import { isoDate, type PlanSelection } from "../shared/use-plan-selection";
import { COLORS } from "./palette";
import { FONT, LabelStrip, Sticker, StickerKind, Tape } from "./pieces";

const DAYS = ["s", "m", "t", "w", "t", "f", "s"];

/** What's picked so far, e.g. "saturday, october 18 at 7:30 pm", or what's still missing. */
function pickStatus(selection: PlanSelection, timezone: string): string {
  if (selection.slot) {
    const w = formatInZone(selection.slot.startsAt, timezone);
    return `${w.weekday}, ${w.date} at ${w.time}`.toLowerCase();
  }
  if (selection.date && selection.time) {
    const { month, day, weekday } = parseIsoDate(selection.date);
    return `${WEEKDAYS[weekday]}, ${MONTHS[month]} ${day} at ${timeLabel(selection.time)}`.toLowerCase();
  }
  if (selection.date) return "and a time?";
  if (selection.time) return "and a day?";
  return "pick a day first";
}

type QuestionPageProps = {
  invite: PublicInvite;
  selection: PlanSelection;
  note: string;
  onNote: (note: string) => void;
  busy: boolean;
  error: string | null;
  onYes: () => void;
  onMaybeLater: () => void;
};

/** The last page: the question, when, a note back, Yes, or maybe later. */
export function QuestionPage({ invite, selection, note, onNote, busy, error, onYes, onMaybeLater }: QuestionPageProps) {
  const ready = !!selection.choice && !busy;
  // The page is drawn twice while it turns, so the note's id must be unique per copy.
  const noteId = useId();
  return (
    <div style={{ position: "relative", padding: "34px 22px 40px", textAlign: "center" }}>
      <Sticker kind={StickerKind.Heart} size={40} style={{ top: 30, left: 18 }} />
      <LabelStrip>the last page</LabelStrip>
      <h1 style={{ fontFamily: FONT.hand, fontSize: 40, fontWeight: 700, lineHeight: 1.05, color: COLORS.ink, margin: "16px 0 8px", textWrap: "balance" }}>
        {invite.question.map((s, i) =>
          s.emphasis ? (
            <span key={i} style={{ background: "linear-gradient(transparent 58%, rgba(143,174,126,.55) 58%)", padding: "0 2px" }}>
              {s.text}
            </span>
          ) : (
            s.text
          ),
        )}
      </h1>

      <When invite={invite} selection={selection} />

      <label htmlFor={noteId} style={{ display: "block", marginTop: 26, fontFamily: FONT.typed, fontSize: 12, color: COLORS.soft }}>
        write back (optional)
      </label>
      <textarea
        id={noteId}
        value={note}
        onChange={(e) => onNote(e.target.value)}
        maxLength={NOTE_MAX_LENGTH}
        rows={2}
        style={{
          display: "block",
          width: "100%",
          marginTop: 6,
          fontFamily: FONT.note,
          fontSize: 16,
          lineHeight: "30px",
          color: COLORS.ink,
          background: "repeating-linear-gradient(transparent 0 29px, rgba(43,38,34,.25) 29px 30px)",
          border: "none",
          outline: "none",
          resize: "none",
          padding: "0 4px",
        }}
      />

      <p aria-live="polite" style={{ fontFamily: FONT.hand, fontSize: 22, minHeight: 28, margin: "18px 0 8px", color: error ? COLORS.brown : COLORS.ink }}>
        {error ?? pickStatus(selection, invite.timezone)}
      </p>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={onYes}
          disabled={!ready}
          style={{
            fontFamily: FONT.marker,
            fontSize: 20,
            color: "#fff",
            background: COLORS.accent,
            border: 0,
            padding: "11px 26px",
            transform: "rotate(-1.5deg)",
            boxShadow: "0 3px 0 rgba(0,0,0,.18)",
            cursor: ready ? "pointer" : "not-allowed",
            opacity: ready ? 1 : 0.4,
            transition: "opacity .2s",
          }}
        >
          {busy ? "sending…" : "yes, I'm in ✦"}
        </button>
        <button
          type="button"
          onClick={onMaybeLater}
          disabled={busy}
          style={{ fontFamily: FONT.marker, fontSize: 15, color: COLORS.soft, background: "none", border: 0, padding: "6px 8px", textDecoration: "underline wavy", cursor: "pointer" }}
        >
          maybe later
        </button>
      </div>
    </div>
  );
}

/** The Creator's Time slots as tickets, and with Custom time a small calendar and times. */
function When({ invite, selection }: { invite: PublicInvite; selection: PlanSelection }) {
  return (
    <section style={{ position: "relative", marginTop: 22, padding: "22px 12px 18px", background: "#f6efe2", boxShadow: "0 2px 5px rgba(0,0,0,.12)", transform: "rotate(-.6deg)" }}>
      <Tape tone="grid" width={80} style={{ top: -10, left: "50%", marginLeft: -40 }} />
      <h2 style={{ fontFamily: FONT.typed, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: COLORS.ink, margin: 0 }}>when works for you?</h2>

      {invite.timeSlots.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {invite.timeSlots.map((s) => {
            const w = formatInZone(s.startsAt, invite.timezone);
            return (
              <Choice key={s.id} selected={selection.slotId === s.id} onClick={() => selection.pickSlot(s.id)}>
                {w.weekdayShort}, {w.date} · {w.time}
              </Choice>
            );
          })}
        </div>
      )}

      {invite.allowCustomTime && (
        <>
          {invite.timeSlots.length > 0 && <p style={{ fontFamily: FONT.hand, fontSize: 19, color: COLORS.soft, margin: "14px 0 0" }}>or another day:</p>}
          <Calendar selection={selection} />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 12 }}>
            {timesFor(invite.timeOfDay).map((t) => (
              <Choice key={t} small selected={!selection.slotId && selection.time === t} onClick={() => selection.pickTime(t)}>
                {timeLabel(t)}
              </Choice>
            ))}
          </div>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, fontFamily: FONT.typed, fontSize: 12, color: COLORS.soft }}>
            or another time
            <input
              type="time"
              value={selection.otherTime}
              onChange={(e) => selection.typeOtherTime(e.target.value)}
              style={{ fontFamily: FONT.typed, fontSize: 14, color: COLORS.ink, background: "transparent", border: "none", borderBottom: `1.5px solid ${COLORS.ink}`, padding: "2px 4px" }}
            />
          </label>
        </>
      )}
    </section>
  );
}

function Calendar({ selection }: { selection: PlanSelection }) {
  const { calendar } = selection;
  const arrow = (label: string, enabled: boolean, step: number, glyph: string) => (
    <button
      type="button"
      aria-label={label}
      disabled={!enabled}
      onClick={() => calendar.page(step)}
      style={{ fontFamily: FONT.typed, fontSize: 18, border: "none", background: "none", cursor: "pointer", visibility: enabled ? "visible" : "hidden", padding: "0 10px", color: COLORS.ink }}
    >
      {glyph}
    </button>
  );
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 12 }}>
        {arrow("previous month", calendar.canGoBack, -1, "‹")}
        <span style={{ fontFamily: FONT.hand, fontSize: 24, minWidth: 150, color: COLORS.ink }}>
          {MONTHS[calendar.month]?.toLowerCase()} {calendar.year}
        </span>
        {arrow("next month", calendar.canGoForward, 1, "›")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 4, marginTop: 4 }}>
        {DAYS.map((d, i) => (
          <span key={i} style={{ fontFamily: FONT.typed, fontSize: 11, color: COLORS.soft }}>
            {d}
          </span>
        ))}
        {calendar.cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />;
          const iso = isoDate(calendar.year, calendar.month, day);
          const past = iso < calendar.todayIso;
          const selected = selection.date === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={past}
              aria-pressed={selected}
              aria-label={`${MONTHS[calendar.month]} ${day}`}
              onClick={() => selection.pickDate(iso)}
              style={{
                height: 34,
                border: "none",
                borderRadius: 34,
                background: selected ? COLORS.accent : "none",
                fontFamily: FONT.typed,
                fontSize: 14,
                color: selected ? "#fff" : past ? "#c9c0b6" : COLORS.ink,
                cursor: past ? "default" : "pointer",
                textDecoration: iso === calendar.todayIso ? "underline" : undefined,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Choice({ selected, small, onClick, children }: { selected: boolean; small?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{
        fontFamily: FONT.typed,
        fontSize: small ? 12.5 : 14,
        padding: small ? "6px 9px" : "10px 12px",
        color: selected ? "#fff" : COLORS.ink,
        background: selected ? COLORS.accent : "#fff",
        border: `1.5px ${selected ? "solid" : "dashed"} ${selected ? COLORS.accent : COLORS.kraft}`,
        cursor: "pointer",
        textTransform: "lowercase",
      }}
    >
      {children}
    </button>
  );
}
