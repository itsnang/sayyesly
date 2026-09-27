"use client";

import { useState } from "react";
import type { PublicInvite } from "../../types";
import type { PlanChoice } from "../../hooks/use-invite-answer";

/** How many months ahead the Recipient can page the calendar. */
const MONTHS_AHEAD = 2;

type Selection = { slotId: string | null; date: string | null; time: string | null };

const pad = (n: number) => String(n).padStart(2, "0");

/** `YYYY-MM-DD` for a year, 0-based month and day. */
export const isoDate = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

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

/**
 * What the Recipient has picked on the Plan screen: one of the Creator's Time
 * slots, or (with Custom time) their own date and time. Picking a slot clears a
 * custom pick and vice versa. `choice` is set once the pick is complete.
 */
export function usePlanSelection(invite: PublicInvite) {
  const [sel, setSel] = useState<Selection>({ slotId: null, date: null, time: null });
  const [monthOffset, setMonthOffset] = useState(0);

  const today = todayIn(invite.timezone);
  const viewMonth = (today.month + monthOffset) % 12;
  const viewYear = today.year + Math.floor((today.month + monthOffset) / 12);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

  const choice: PlanChoice | null = sel.slotId
    ? { kind: "slot", timeSlotId: sel.slotId }
    : sel.date && sel.time
      ? { kind: "custom", date: sel.date, time: sel.time }
      : null;

  return {
    slotId: sel.slotId,
    date: sel.date,
    time: sel.time,
    slot: invite.timeSlots.find((s) => s.id === sel.slotId) ?? null,
    choice,
    pickSlot: (id: string) => setSel({ slotId: id, date: null, time: null }),
    pickDate: (iso: string) => setSel((prev) => ({ slotId: null, date: iso, time: prev.slotId ? null : prev.time })),
    pickTime: (value: string | null) =>
      setSel((prev) => ({ slotId: null, date: prev.slotId ? null : prev.date, time: value })),
    calendar: {
      year: viewYear,
      month: viewMonth,
      todayIso: isoDate(today.year, today.month, today.day),
      /** Leading nulls pad the first week to its weekday; then each day of the month. */
      cells: [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      ] as (number | null)[],
      canGoBack: monthOffset > 0,
      canGoForward: monthOffset < MONTHS_AHEAD,
      page: (delta: number) => setMonthOffset((o) => o + delta),
    },
  };
}
