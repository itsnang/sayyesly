import { enumValues, TimeOfDay } from "@/lib/enums";

/** Every Part of the day, in order (morning first), for pickers. */
export const TIMES_OF_DAY = enumValues(TimeOfDay);

export const DEFAULT_TIME_OF_DAY: TimeOfDay = TimeOfDay.Evening;

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  [TimeOfDay.Morning]: "Morning",
  [TimeOfDay.Lunch]: "Lunch",
  [TimeOfDay.Afternoon]: "Afternoon",
  [TimeOfDay.Evening]: "Evening",
};

// Five half-hour times each (HH:mm, in the Invite's time zone): the ones a
// Recipient taps when they pick, and the studio's quick times.
const TIMES: Record<TimeOfDay, readonly string[]> = {
  [TimeOfDay.Morning]: ["08:00", "08:30", "09:00", "09:30", "10:00"],
  [TimeOfDay.Lunch]: ["11:30", "12:00", "12:30", "13:00", "13:30"],
  [TimeOfDay.Afternoon]: ["15:00", "15:30", "16:00", "16:30", "17:00"],
  [TimeOfDay.Evening]: ["18:30", "19:00", "19:30", "20:00", "20:30"],
};

/** The times offered around a part of the day, earliest first (Evening's if it's missing). */
export function timesFor(timeOfDay: TimeOfDay | undefined): readonly string[] {
  return TIMES[timeOfDay ?? DEFAULT_TIME_OF_DAY];
}
