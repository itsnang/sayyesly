import { utcToZonedParts } from "@/lib/time";
import type { InviteFormValues } from "../schemas";
import type { ThemeContent } from "../themes/types";
import { timesFor } from "./time-of-day";

/**
 * The form values the studio preview shows: the Theme's example stands in for
 * the headline, note, picture and plan photos while the Creator leaves them
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
  if (!values.allowCustomTime && !values.timeSlots?.length) {
    const { date } = utcToZonedParts(new Date(now + 86_400_000), values.timezone || "UTC");
    const times = timesFor(values.timeOfDay);
    next.timeSlots = [{ date, time: times[1] ?? times[0]! }];
    filled.push("time");
  }
  return { values: next, filled };
}
