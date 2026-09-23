/** Milliseconds `timeZone` is ahead of UTC at the given instant. */
function offsetAt(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(new Date(instant));
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/**
 * The instant at which the wall clock in `timeZone` reads `date` (YYYY-MM-DD)
 * and `time` (HH:mm). Null when the input isn't a real date/time.
 */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t) return null;
  const [year, month, day, hour, minute] = [d[1], d[2], d[3], t[1], t[2]].map(Number) as [
    number,
    number,
    number,
    number,
    number,
  ];
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;

  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  if (new Date(wallAsUtc).getUTCDate() !== day) return null; // e.g. Feb 30

  // Two passes settle the offset across a DST change.
  let instant = wallAsUtc - offsetAt(wallAsUtc, timeZone);
  instant = wallAsUtc - offsetAt(instant, timeZone);
  return new Date(instant);
}

/** The wall-clock date (YYYY-MM-DD) and time (HH:mm) of an instant in `timeZone`. */
export function utcToZonedParts(instant: Date, timeZone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

/** True when `timeZone` is a zone this runtime knows, e.g. "Asia/Phnom_Penh". */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}
