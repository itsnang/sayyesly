import { utcToZonedParts } from "@/lib/time";
import type { InviteFormValues } from "../schemas";
import type { ThemeContent } from "../themes/types";
import { timesFor } from "./time-of-day";

/**
 * The form values the studio preview shows: the Theme's example stands in for
 * the headline, note, picture, plan photos and Stops while the Creator leaves them
 * empty (an empty Plan text stays empty, since that previews a surprise), and
 * "I'll pick the times" with no times yet shows one for tomorrow.
 * `filled` names what came from the example, for the preview's label.
 */
export function withExample(values: InviteFormValues, content: ThemeContent, now = Date.now()): { values: InviteFormValues; filled: string[] } {
  const { example } = content;
  const next = { ...values };
  const filled: string[] = [];

  if (!values.question?.replace(/\*/g, "").trim()) {
    next.question = example.question;
    filled.push(content.question.label.toLowerCase());
  }
  if (content.note && !values.message?.trim()) {
    next.message = example.note;
    filled.push("note");
  }
  if (content.picture && example.picture && !values.imageUrl?.trim()) {
    next.imageUrl = example.picture;
    filled.push("photo");
  }
  if (content.planPhotos && !values.planPhotos?.some((p) => p.url)) {
    next.planPhotos = example.planPhotos.map((p) => ({ url: p.url, alt: p.alt, caption: p.caption ?? "" }));
    filled.push("plan photos");
  }
  // Stops count as written once one has a title; until then the example's stand in.
  if (content.stops && example.stops && !values.planStops?.some((s) => s.title.trim())) {
    next.planStops = example.stops.map((s) => ({
      title: s.title,
      line: s.line ?? "",
      time: s.time ?? "",
      description: s.description ?? "",
      place: s.place ?? "",
      mapUrl: s.mapUrl ?? "",
      photos: s.photos.map((p) => ({ url: p.url, alt: p.alt, caption: p.caption ?? "" })),
    }));
    if (!values.planTitle?.trim() && example.planTitle) next.planTitle = example.planTitle;
    filled.push(`${content.stops.label}s`);
  }
  if (!values.allowCustomTime && !values.timeSlots?.length) {
    const { date } = utcToZonedParts(new Date(now + 86_400_000), values.timezone || "UTC");
    const times = timesFor(values.timeOfDay);
    next.timeSlots = [{ date, time: times[1] ?? times[0]! }];
    filled.push("time");
  }
  return { values: next, filled };
}
