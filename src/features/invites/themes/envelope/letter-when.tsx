"use client";

import type { ReactNode } from "react";
import type { PublicInvite } from "../../types";
import { timesFor } from "../../utils/time-of-day";
import { formatInZone, MONTHS, timeLabel } from "../shared/format";
import { isoDate, type PlanSelection } from "../shared/use-plan-selection";
import { Label, penStyle } from "./lettering";
import { InkCircle } from "./ornaments";

const WEEKDAYS = ["s", "m", "t", "w", "t", "f", "s"];

/** "when works for you?": the Creator's Time slots, and with Custom time a hand-drawn calendar and times. */
export function LetterWhen({ invite, selection }: { invite: PublicInvite; selection: PlanSelection }) {
  return (
    <section style={{ textAlign: "center" }}>
      <h2 style={{ fontFamily: "var(--env-marker)", fontWeight: 400, fontSize: 34, color: "var(--env-ink)" }}>when works for you?</h2>

      {invite.timeSlots.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, marginTop: 22 }}>
          {invite.timeSlots.map((s) => {
            const w = formatInZone(s.startsAt, invite.timezone);
            return (
              <CircledChoice key={s.id} selected={selection.slotId === s.id} onClick={() => selection.pickSlot(s.id)}>
                {w.weekday}, {w.date} · {w.time}
              </CircledChoice>
            );
          })}
        </div>
      )}

      {invite.allowCustomTime && (
        <>
          {invite.timeSlots.length > 0 && <p style={{ ...penStyle, color: "var(--env-graphite)", marginTop: 28 }}>or another day:</p>}
          <LetterCalendar selection={selection} />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px 24px", marginTop: 26 }}>
            {timesFor(invite.timeOfDay).map((t) => (
              <CircledChoice key={t} selected={!selection.slotId && selection.time === t} onClick={() => selection.pickTime(t)}>
                {timeLabel(t)}
              </CircledChoice>
            ))}
          </div>
          <label style={{ ...penStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18, color: "var(--env-graphite)" }}>
            or another time
            <input
              type="time"
              value={selection.otherTime}
              onChange={(e) => selection.typeOtherTime(e.target.value)}
              style={{
                fontFamily: "var(--env-print)",
                fontSize: 14,
                color: "var(--env-ink)",
                background: "transparent",
                border: "none",
                borderBottom: "1.5px solid var(--env-ink)",
                padding: "2px 4px",
              }}
            />
          </label>
        </>
      )}
    </section>
  );
}

/** The month, its arrows and its days, with the picked day circled in ink. */
function LetterCalendar({ selection }: { selection: PlanSelection }) {
  const { calendar } = selection;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 18 }}>
        <MonthArrow label="previous month" enabled={calendar.canGoBack} onClick={() => calendar.page(-1)}>
          ‹
        </MonthArrow>
        <span style={{ ...penStyle, fontSize: 28, minWidth: 170 }}>
          {MONTHS[calendar.month]?.toLowerCase()} {calendar.year}
        </span>
        <MonthArrow label="next month" enabled={calendar.canGoForward} onClick={() => calendar.page(1)}>
          ›
        </MonthArrow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 6, maxWidth: 330, margin: "8px auto 0" }}>
        {WEEKDAYS.map((d, i) => (
          <Label key={i} align="center">
            {d}
          </Label>
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
                position: "relative",
                height: 40,
                border: "none",
                background: "none",
                fontFamily: "var(--env-pen)",
                fontSize: 25,
                color: past ? "var(--env-faint)" : "var(--env-ink)",
                cursor: past ? "default" : "pointer",
                textDecoration: iso === calendar.todayIso ? "underline" : undefined,
                textUnderlineOffset: 4,
              }}
            >
              {day}
              {selected && <InkCircle pad={2} />}
            </button>
          );
        })}
      </div>
    </>
  );
}

function CircledChoice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{ ...penStyle, position: "relative", border: "none", background: "none", padding: "2px 6px", cursor: "pointer", textTransform: "lowercase" }}
    >
      {children}
      {selected && <InkCircle pad={7} />}
    </button>
  );
}

function MonthArrow({ label, enabled, onClick, children }: { label: string; enabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!enabled}
      onClick={onClick}
      style={{ ...penStyle, fontSize: 30, border: "none", background: "none", cursor: "pointer", visibility: enabled ? "visible" : "hidden", padding: "0 8px" }}
    >
      {children}
    </button>
  );
}
