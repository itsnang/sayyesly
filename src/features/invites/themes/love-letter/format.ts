export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** An instant in the Invite's time zone, e.g. { day: "Saturday, September 26", time: "7:30 PM" }. */
export function formatWhen(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone, ...o }).format(d);
  return { day: f({ weekday: "long", month: "long", day: "numeric" }), time: f({ hour: "numeric", minute: "2-digit" }) };
}

/** `19:30` → `7:30 PM` */
export function timeLabel(value: string) {
  const [h = 0, m = 0] = value.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** A custom date and time as picked, already in the Invite's time zone. */
export function customLabel(date: string, time: string) {
  const [y = 0, m = 1, d = 1] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  return `${weekday}, ${MONTHS[m - 1]} ${d} at ${timeLabel(time)}`;
}
