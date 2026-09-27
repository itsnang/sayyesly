import type { InviteFormValues } from "../schemas";
import type { ThemeContent } from "../themes/types";

/**
 * The form values the studio preview shows: the Theme's example stands in for
 * the headline, note, picture and plan photos while the Creator leaves them
 * empty (an empty Plan text stays empty, since that previews a surprise).
 * `filled` names what came from the example, for the preview's label.
 */
export function withExample(values: InviteFormValues, content: ThemeContent): { values: InviteFormValues; filled: string[] } {
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
  return { values: next, filled };
}
