import { TIMES_OF_DAY, type TimeOfDay } from "@/lib/time/time-of-day";

export { TIMES_OF_DAY, type TimeOfDay };

export const DEFAULT_TIME_OF_DAY: TimeOfDay = "evening";

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: "Morning",
  lunch: "Lunch",
  afternoon: "Afternoon",
  evening: "Evening",
};

// Five half-hour times each (HH:mm, in the Invite's time zone): the ones a
// Recipient taps when they pick, and the studio's quick times.
const TIMES: Record<TimeOfDay, readonly string[]> = {
  morning: ["08:00", "08:30", "09:00", "09:30", "10:00"],
  lunch: ["11:30", "12:00", "12:30", "13:00", "13:30"],
  afternoon: ["15:00", "15:30", "16:00", "16:30", "17:00"],
  evening: ["18:30", "19:00", "19:30", "20:00", "20:30"],
};

/** The times offered around a part of the day, earliest first (Evening's if it's missing). */
export function timesFor(timeOfDay: TimeOfDay | undefined): readonly string[] {
  return TIMES[timeOfDay ?? DEFAULT_TIME_OF_DAY] ?? TIMES[DEFAULT_TIME_OF_DAY];
}
