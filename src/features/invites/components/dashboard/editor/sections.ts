import type { FieldErrors, FieldPath } from "react-hook-form";
import { enumValues } from "@/lib/enums";
import { StudioSection } from "../../../enums";
import type { InviteFormValues } from "../../../schemas";
import type { ThemeContent } from "../../../themes";
import { kittenSoftContent } from "../../../themes/kitten-soft";
import { recognizeSong } from "../../../utils/song";
import { DEFAULT_TIME_OF_DAY, TIME_OF_DAY_LABELS } from "../../../utils/time-of-day";

// What the studio's optional sections are and say about themselves: every
// field in them already has a working default. Pure, so the editor's parts
// only render.

type Field = FieldPath<InviteFormValues>;

/** Which form fields each section holds, so a problem opens the right one. */
export const SECTION_FIELDS: Record<StudioSection, Field[]> = {
  [StudioSection.Plan]: ["planPlace", "planActivity", "planMapUrl", "planDressCode", "planNotes", "planPhotos"],
  [StudioSection.When]: ["timezone", "timeSlots", "allowCustomTime", "timeOfDay"],
  [StudioSection.Extras]: ["message", "imageUrl", "songUrl"],
};

const SECTION_TITLES: Record<StudioSection, string> = {
  [StudioSection.Plan]: "Plan",
  [StudioSection.When]: "When",
  [StudioSection.Extras]: "Extras",
};

/** The always-open fields above the sections. */
export const MAIN_FIELDS: Field[] = ["question", "recipientName", "themeId"];

/** Used only if the selected Theme is missing from the list: show everything, name nothing theme-specific. */
export const ALL_CONTENT: ThemeContent = {
  question: { label: "Question" },
  picture: { label: "Picture", whenEmpty: "the theme's own picture" },
  note: true,
  planPhotos: true,
  song: true,
  example: kittenSoftContent.example,
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The Extras section's name, after what the selected Theme actually shows, e.g. "Note, picture & song" (null: nothing to set). */
export function extrasTitle(content: ThemeContent): string | null {
  const names = [content.note && "note", content.picture && "picture", content.song && "song"].filter((n): n is string => !!n);
  if (names.length === 0) return null;
  const title = names.length === 1 ? names[0]! : `${names.slice(0, -1).join(", ")} & ${names.at(-1)!}`;
  return capitalize(title);
}

/** A section's heading: Extras is named after what the Theme shows. */
export function sectionTitle(id: StudioSection, content: ThemeContent): string {
  return (id === StudioSection.Extras && extrasTitle(content)) || SECTION_TITLES[id];
}

/** Whether any of these fields (or their nested items) has an error. */
export const hasError = (errors: FieldErrors<InviteFormValues>, fields: Field[]) => fields.some((f) => f.split(".")[0]! in errors);

/** The sections with a problem, in form order. */
export const sectionsWithErrors = (errors: FieldErrors<InviteFormValues>) =>
  enumValues(StudioSection).filter((id) => hasError(errors, SECTION_FIELDS[id]));

/** One short line saying what the Recipient gets from a section right now. */
export function summarise(id: StudioSection, v: InviteFormValues, content: ThemeContent): string {
  switch (id) {
    case StudioSection.Plan: {
      const main = [v.planPlace?.trim(), v.planActivity?.trim()].filter(Boolean).join(" · ");
      const photos = content.planPhotos ? (v.planPhotos?.length ?? 0) : 0;
      const extras = [v.planMapUrl, v.planDressCode, v.planNotes].filter((x) => x?.trim()).length + photos;
      if (main) return extras ? `${main} +${extras}` : main;
      return extras ? count(extras, "detail", "details") : "A surprise";
    }
    case StudioSection.When: {
      if (v.allowCustomTime) return `They pick · ${TIME_OF_DAY_LABELS[v.timeOfDay ?? DEFAULT_TIME_OF_DAY]}`;
      const n = v.timeSlots?.length ?? 0;
      return n === 0 ? "Needs a time" : count(n, "time", "times");
    }
    case StudioSection.Extras: {
      const parts: string[] = [];
      if (content.note && v.message?.trim()) parts.push(`“${v.message.trim()}”`);
      if (content.picture) {
        // What they'll actually get, e.g. "Just the letter" (the preview may be showing an example photo).
        parts.push(v.imageUrl?.trim() ? "Your picture" : capitalize(content.picture.whenEmpty));
      }
      if (content.song && v.songUrl?.trim() && recognizeSong(v.songUrl).ok) parts.push("♪ Song");
      return parts.join(" · ") || "None";
    }
  }
}
