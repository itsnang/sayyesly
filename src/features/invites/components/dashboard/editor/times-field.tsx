"use client";

import { useMemo, useState } from "react";
import { Button, Input } from "@/components/shared/ui";
import { zonedTimeToUtc } from "@/lib/time";

export type SlotValue = { date: string; time: string };

const QUICK_TIMES: [string, string][] = [
  ["12:00", "Noon"],
  ["18:30", "6:30 PM"],
  ["19:00", "7:00 PM"],
  ["19:30", "7:30 PM"],
  ["20:00", "8:00 PM"],
];

/** The next `days` calendar days in `timeZone`, as YYYY-MM-DD plus labels. */
function upcomingDays(timeZone: string, days: number, now: number) {
  const out: { date: string; weekday: string; day: string }[] = [];
  for (let i = 0; i < days; i++) {
    const at = new Date(now + i * 86_400_000);
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
    const weekday = i === 0 ? "Today" : i === 1 ? "Tmrw" : new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(at);
    const day = new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric" }).format(at);
    out.push({ date: parts, weekday, day });
  }
  return out;
}

function slotLabel(slot: SlotValue, timeZone: string): string {
  const at = zonedTimeToUtc(slot.date, slot.time, timeZone);
  if (!at) return `${slot.date} ${slot.time}`;
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(at);
}

type TimesFieldProps = {
  slots: SlotValue[];
  timezone: string;
  onAdd: (slot: SlotValue) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
  max: number;
};

/** Offer evenings in one tap each, or add a specific date and time. */
export function TimesField({ slots, timezone, onAdd, onRemove, disabled, max }: TimesFieldProps) {
  const [time, setTime] = useState("19:00");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("19:00");
  // "Now" is fixed per mount so rendering stays pure.
  const [now] = useState(() => Date.now());
  const days = useMemo(() => upcomingDays(timezone, 10, now), [timezone, now]);
  const full = slots.length >= max;

  const indexOf = (s: SlotValue) => slots.findIndex((x) => x.date === s.date && x.time === s.time);
  const toggle = (s: SlotValue) => {
    const i = indexOf(s);
    if (i >= 0) onRemove(i);
    else if (!full) onAdd(s);
  };

  const sorted = slots
    .map((s, i) => ({ s, i, at: zonedTimeToUtc(s.date, s.time, timezone)?.getTime() ?? 0 }))
    .sort((a, b) => a.at - b.at);

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : ""}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-muted">Quick add at</span>
        <div className="flex flex-wrap gap-1 rounded-full border border-ink/15 bg-surface p-1">
          {QUICK_TIMES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTime(value)}
              aria-pressed={time === value}
              className={`rounded-full px-3 py-1 text-[13px] transition ${time === value ? "bg-ink text-canvas" : "text-ink hover:bg-card"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {days.map((d) => {
          const slot = { date: d.date, time };
          const on = indexOf(slot) >= 0;
          const past = (zonedTimeToUtc(d.date, time, timezone)?.getTime() ?? 0) <= now;
          return (
            <button
              key={d.date}
              type="button"
              disabled={past || (full && !on)}
              aria-pressed={on}
              onClick={() => toggle(slot)}
              className={`flex min-w-[68px] shrink-0 flex-col items-center rounded-xl border px-2 py-2 transition ${
                on ? "border-ink bg-ink text-canvas" : "border-ink/15 bg-card text-ink hover:border-ink/50"
              } disabled:cursor-not-allowed disabled:opacity-35`}
            >
              <span className="text-[11px] tracking-wide uppercase opacity-70">{d.weekday}</span>
              <span className="text-[14px] font-medium">{d.day}</span>
            </button>
          );
        })}
      </div>

      <details className="mt-3 group">
        <summary className="cursor-pointer list-none text-[13px] text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink [&::-webkit-details-marker]:hidden">
          + A specific date and time
        </summary>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="w-auto flex-1" aria-label="Date" />
          <Input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} className="w-auto" aria-label="Time" />
          <Button
            variant="secondary"
            disabled={!customDate || !customTime || full}
            onClick={() => {
              const s = { date: customDate, time: customTime };
              if (indexOf(s) < 0) onAdd(s);
              setCustomDate("");
            }}
          >
            Add
          </Button>
        </div>
      </details>

      <div className="mt-5">
        <p className="text-[13px] font-medium text-ink">
          You&apos;re offering {slots.length === 0 ? "no times yet" : slots.length === 1 ? "1 time" : `${slots.length} times`}
          {full && <span className="font-normal text-muted"> (that&apos;s the most)</span>}
        </p>
        {sorted.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {sorted.map(({ s, i }) => (
              <li key={`${s.date}-${s.time}`} className="flex items-center gap-1 rounded-full border border-ink/20 bg-card py-1 pr-1 pl-3 text-[13.5px] text-ink">
                {slotLabel(s, timezone)}
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label={`Remove ${slotLabel(s, timezone)}`}
                  className="grid size-6 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
