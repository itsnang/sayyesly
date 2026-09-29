import "server-only";
import type { NewInvite } from "@/lib/db/schema";
import { zonedTimeToUtc } from "@/lib/time";
import { inviteFormSchema, type InviteFormValues } from "../schemas";
import { DEFAULT_SONG_LENGTH, songFromUrl } from "../utils/song";

// Turning the studio's form into what's saved. Shared by the save action; no
// database access here.

const emptyToNull = (v: string) => (v === "" ? null : v);
// Saved in one form whatever was pasted (youtu.be, Shorts, ?si=…), so it compares and plays the same.
const canonicalSongUrl = (v: string) => songFromUrl(v)?.url ?? null;

/**
 * Validates what the browser sent. A studio tab from before Songs existed (left
 * open across a deploy) sends none: it saves without one, and one from before
 * the part could be chosen plays from the start. (The type says they're there;
 * the browser that sent it may not know that.)
 */
export function readInviteForm(input: InviteFormValues): { ok: true; values: InviteFormValues } | { ok: false; error: string } {
  const sent: Partial<InviteFormValues> | null = input && typeof input === "object" ? input : null;
  const parsed = inviteFormSchema.safeParse(
    sent ? { ...sent, songUrl: sent.songUrl ?? "", songStart: sent.songStart ?? 0, songLength: sent.songLength ?? DEFAULT_SONG_LENGTH } : input,
  );
  return parsed.success ? { ok: true, values: parsed.data } : { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
}

/**
 * The Invite's columns from the form, in two groups: `editable` can always
 * change; `lockable` (the question, times and Theme) only until it's answered.
 */
export function toInviteColumns(values: InviteFormValues) {
  const editable = {
    recipientName: values.recipientName,
    message: emptyToNull(values.message),
    imageUrl: emptyToNull(values.imageUrl),
    planPlace: emptyToNull(values.planPlace),
    planActivity: emptyToNull(values.planActivity),
    planMapUrl: emptyToNull(values.planMapUrl),
    planDressCode: emptyToNull(values.planDressCode),
    planNotes: emptyToNull(values.planNotes),
    planPhotos: values.planPhotos.map((p) => ({ url: p.url, alt: p.alt || "plan photo", ...(p.caption ? { caption: p.caption } : {}) })),
    songUrl: canonicalSongUrl(values.songUrl),
    songStart: values.songStart,
    songLength: values.songLength,
  } satisfies Partial<NewInvite>;

  const lockable = {
    question: values.question,
    timezone: values.timezone,
    allowCustomTime: values.allowCustomTime,
    timeOfDay: values.timeOfDay,
    themeId: values.themeId,
  } satisfies Partial<NewInvite>;

  return { editable, lockable };
}

/**
 * The Time slots the form asks for, as instants in the Invite's time zone
 * (null if one isn't a real date). "Let them pick" means a calendar and no Time
 * slots: any times still in the form from before switching modes aren't saved.
 */
export function wantedTimeSlots(values: InviteFormValues): Date[] | null {
  const wanted: Date[] = [];
  for (const slot of values.allowCustomTime ? [] : values.timeSlots) {
    const at = zonedTimeToUtc(slot.date, slot.time, values.timezone);
    if (!at) return null;
    wanted.push(at);
  }
  return wanted;
}
