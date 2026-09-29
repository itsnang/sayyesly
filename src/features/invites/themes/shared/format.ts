export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** A picked calendar day (`2026-09-26`): its year, 0-based month, day and weekday (0 = Sunday). */
export function parseIsoDate(iso: string) {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
  return { year, month: month - 1, day, weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay() };
}

/** A picked time (`19:30`), as `7:30 PM`. */
export function timeLabel(value: string) {
  const [h = 0, m = 0] = value.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** An instant as shown in the Invite's time zone, not the viewer's. */
export function formatInZone(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone, ...options }).format(d);
  return {
    weekday: f({ weekday: "long" }),
    weekdayShort: f({ weekday: "short" }),
    date: f({ month: "long", day: "numeric" }),
    time: f({ hour: "numeric", minute: "2-digit" }),
  };
}
