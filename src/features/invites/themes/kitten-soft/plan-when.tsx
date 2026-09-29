"use client";

import type { PublicInvite } from "../../types";
import { timesFor } from "../../utils/time-of-day";
import { MONTHS, parseIsoDate, timeLabel as sharedTimeLabel } from "../shared/format";
import { isoDate, type PlanSelection } from "../shared/use-plan-selection";
import { formatInZone, PillButton, Prompt } from "./shared";

const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const monthName = (m: number) => MONTHS[m]?.toLowerCase() ?? "";
/** A time in this Theme's lowercase voice, e.g. "7:30 pm". */
export const timeLabel = (value: string) => sharedTimeLabel(value).toLowerCase();

/** A picked day, e.g. "september 26". */
export function dateLabel(iso: string) {
  const { month, day } = parseIsoDate(iso);
  return `${monthName(month)} ${day}`;
}

/** Picking when: the Creator's Time slots as pills, and with Custom time a calendar and times. */
export function PlanWhen({ invite, selection }: { invite: PublicInvite; selection: PlanSelection }) {
  return (
    <>
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
          <Prompt>{invite.timeSlots.length > 0 ? "or another day?" : <>when you&apos;re free?</>}</Prompt>
          <PlanCalendar selection={selection} />

          <Prompt>what time?</Prompt>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {timesFor(invite.timeOfDay).map((value) => (
              <PillButton key={value} selected={!selection.slotId && selection.time === value} onClick={() => selection.pickTime(value)}>
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
              value={selection.otherTime}
              onChange={(e) => selection.typeOtherTime(e.target.value)}
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
    </>
  );
}

/** The month with its arrows, and its days: today dotted, the picked day filled in. */
function PlanCalendar({ selection }: { selection: PlanSelection }) {
  const { calendar } = selection;
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
    </>
  );
}
