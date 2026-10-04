import type { AnswerRow, Invite, PlanPhoto, PlanStop } from "@/lib/db/schema";
import type { AnswerKind } from "@/lib/enums";
import { utcToZonedParts, zonedTimeToUtc } from "@/lib/time";
import { safeHttpUrl } from "@/lib/validation";
import { InviteStatus } from "../enums";
import type { InviteFormValues, StopFormValues } from "../schemas";
import type { PublicAnswer, PublicInvite, Stop } from "../types";
import { isExpired } from "./answer";
import { parseQuestion } from "./question";
import { DEFAULT_SONG_LENGTH, songClip, songFromUrl } from "./song";
import { DEFAULT_TIME_OF_DAY } from "./time-of-day";
import type { SavedSlot } from "./time-slots";

// Every translation of an Invite's fields lives here: the blank Invite, form
// values ↔ saved columns, a saved Invite → what its Theme shows, and where the
// Invite stands. The Invite page, the studio, its preview, the demo, saving and
// duplicating all go through it, so a field is mapped once and the preview
// can't drift from the page. No database access: the browser preview uses it too.

/** The columns that hold what an Invite says and how it looks: everything a Creator edits. */
export type InviteContent = Pick<
  Invite,
  | "themeId"
  | "recipientName"
  | "question"
  | "message"
  | "imageUrl"
  | "planPlace"
  | "planActivity"
  | "planMapUrl"
  | "planDressCode"
  | "planNotes"
  | "planPhotos"
  | "planTitle"
  | "planStops"
  | "songUrl"
  | "songStart"
  | "songLength"
  | "timezone"
  | "allowCustomTime"
  | "timeOfDay"
>;

/** An Invite as saved: its content, its share link slug and its Time slots. */
export type SavedInvite = InviteContent & { slug: string; timeSlots: SavedSlot[] };

export type InviteState<S> = {
  /** Its Answer's kind, or why there isn't one yet */
  status: InviteStatus;
  /** Every Time slot has passed and no Custom time is allowed: without an Answer, it couldn't be answered */
  outOfTimes: boolean;
  /** The Time slots still ahead, soonest first */
  upcomingSlots: S[];
};

/** Where an Invite stands at `now`. An Answer beats Expired. */
export function inviteState<S extends SavedSlot>(
  invite: { allowCustomTime: boolean; timeSlots: S[]; answer: { kind: AnswerKind } | null },
  now: Date,
): InviteState<S> {
  const outOfTimes = isExpired(invite, now);
  const upcomingSlots = invite.timeSlots
    .filter((s) => s.startsAt.getTime() > now.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const status = invite.answer ? invite.answer.kind : outOfTimes ? InviteStatus.Expired : InviteStatus.Waiting;
  return { status, outOfTimes, upcomingSlots };
}

export function toPublicAnswer(answer: Pick<AnswerRow, "kind" | "startsAt" | "note">): PublicAnswer {
  return {
    answer: answer.kind,
    startsAt: answer.startsAt?.toISOString() ?? null,
    note: answer.note,
  };
}

// A Plan with several Stops. An Invite saved before Stops (or never given any)
// still has its one place: shown in, or edited for, a Theme with several Stops,
// that place stands in as the only Stop, so nothing the Creator wrote is lost.

/** What the stand-in Stop is called: what you'll do there, else the place. */
const standInTitle = (activity: string | null, place: string | null) => activity || place || "our day";

/** The one place as a Stop, or null when nothing is planned at all. */
function placeAsStop(invite: Pick<InviteContent, "planPlace" | "planActivity" | "planMapUrl" | "planPhotos">): PlanStop | null {
  const { planPlace: place, planActivity: activity, planMapUrl: mapUrl, planPhotos: photos } = invite;
  if (!place && !activity && !mapUrl && photos.length === 0) return null;
  return { title: standInTitle(activity, place), ...(place ? { place } : {}), ...(mapUrl ? { mapUrl } : {}), photos };
}

function toPublicStop(stop: PlanStop): Stop {
  return {
    title: stop.title,
    line: stop.line ?? null,
    time: stop.time ?? null,
    description: stop.description ?? null,
    place: stop.place ?? null,
    mapUrl: safeHttpUrl(stop.mapUrl ?? null),
    photos: stop.photos,
  };
}

/** What the Invite's Theme shows the Recipient at `now`: only upcoming Time slots, a safe map link, the Song's chosen part. */
export function toPublicInvite(
  invite: SavedInvite,
  answer: Pick<AnswerRow, "kind" | "startsAt" | "note"> | null,
  now: Date,
): PublicInvite {
  const state = inviteState({ ...invite, answer }, now);
  return {
    slug: invite.slug,
    themeId: invite.themeId,
    recipientName: invite.recipientName,
    question: parseQuestion(invite.question),
    message: invite.message,
    imageUrl: invite.imageUrl,
    plan: {
      place: invite.planPlace,
      activity: invite.planActivity,
      mapUrl: safeHttpUrl(invite.planMapUrl),
      dressCode: invite.planDressCode,
      notes: invite.planNotes,
      photos: invite.planPhotos,
      title: invite.planTitle,
      stops: (invite.planStops.length > 0 ? invite.planStops : [placeAsStop(invite)].filter((s) => s !== null)).map(toPublicStop),
    },
    timezone: invite.timezone,
    timeSlots: state.upcomingSlots.map((slot) => ({ id: slot.id, startsAt: slot.startsAt.toISOString() })),
    allowCustomTime: invite.allowCustomTime,
    timeOfDay: invite.timeOfDay,
    song: songClip(invite.songUrl, invite.songStart, invite.songLength),
    answer: answer ? toPublicAnswer(answer) : null,
    expired: state.status === InviteStatus.Expired,
  };
}

/**
 * A new Invite's form values in `themeId`: nothing written yet, and "Let them
 * pick" an evening time. An empty question shows the Theme's example in the
 * preview until the Creator writes their own.
 */
export function blankInviteForm(themeId: string, overrides: Partial<InviteFormValues> = {}): InviteFormValues {
  return {
    recipientName: "",
    question: "",
    message: "",
    imageUrl: "",
    planPlace: "",
    planActivity: "",
    planMapUrl: "",
    planDressCode: "",
    planNotes: "",
    planPhotos: [],
    planTitle: "",
    planStops: [],
    songUrl: "",
    songStart: 0,
    songLength: DEFAULT_SONG_LENGTH,
    timezone: "Asia/Phnom_Penh",
    allowCustomTime: true,
    timeOfDay: DEFAULT_TIME_OF_DAY,
    timeSlots: [],
    themeId,
    ...overrides,
  };
}

const emptyToNull = (v: string) => (v === "" ? null : v);

// A row without a picture can only be mid-edit (the schema refuses it), so the preview skips it.
const savedPhotos = (rows: InviteFormValues["planPhotos"], fallbackAlt: string): PlanPhoto[] =>
  rows.filter((p) => p.url).map((p) => ({ url: p.url, alt: p.alt || fallbackAlt, ...(p.caption ? { caption: p.caption } : {}) }));

const photoRows = (photos: PlanPhoto[]): InviteFormValues["planPhotos"] =>
  photos.map((p) => ({ url: p.url, alt: p.alt, caption: p.caption ?? "" }));

/** A Stop as saved: its title and photos, and only the parts that were filled in. */
function savedStop(stop: StopFormValues): PlanStop {
  const optional = (["line", "time", "description", "place", "mapUrl"] as const).filter((k) => stop[k] !== "");
  return { title: stop.title, ...Object.fromEntries(optional.map((k) => [k, stop[k]])), photos: savedPhotos(stop.photos, "stop photo") };
}

function stopRow(stop: PlanStop): StopFormValues {
  return {
    title: stop.title,
    line: stop.line ?? "",
    time: stop.time ?? "",
    description: stop.description ?? "",
    place: stop.place ?? "",
    mapUrl: stop.mapUrl ?? "",
    photos: photoRows(stop.photos),
  };
}

const BLANK_STOP: StopFormValues = { title: "", line: "", time: "", description: "", place: "", mapUrl: "", photos: [] };

/**
 * The Stops the studio starts from when the Theme shows several: those already
 * there; else the one place as a Stop, so nothing typed disappears; else one
 * empty Stop to fill in.
 */
export function startingStops(values: InviteFormValues): StopFormValues[] {
  if (values.planStops.length > 0) return values.planStops;
  const { planPlace: place, planActivity: activity, planMapUrl: mapUrl, planPhotos: photos } = values;
  if (!place && !activity && !mapUrl && photos.length === 0) return [BLANK_STOP];
  return [{ ...BLANK_STOP, title: standInTitle(activity, place), place, mapUrl, photos }];
}
// Saved in one form whatever was pasted (youtu.be, Shorts, ?si=…), so it compares and plays the same.
const canonicalSongUrl = (v: string) => songFromUrl(v)?.url ?? null;

export type FormAsSaved = {
  /** Everything the Invite's columns will hold: `editable` and `lockable` together */
  content: InviteContent;
  /** Can always change */
  editable: Omit<InviteContent, keyof FormAsSaved["lockable"]>;
  /** The question, time zone, Custom time, Part of the day and Theme: locked once the Invite is answered */
  lockable: Pick<InviteContent, "question" | "timezone" | "allowCustomTime" | "timeOfDay" | "themeId">;
  /** The Time slots asked for, as instants in the Invite's time zone (none for "Let them pick") */
  timeSlots: Date[];
  /** False when one of the times isn't a real date; it's left out of `timeSlots` */
  allTimesReal: boolean;
};

/** What saving the studio's form stores. Assumes the form passed `inviteFormSchema`, except in the preview. */
export function formToSaved(values: InviteFormValues): FormAsSaved {
  const editable = {
    recipientName: values.recipientName,
    message: emptyToNull(values.message),
    imageUrl: emptyToNull(values.imageUrl),
    planPlace: emptyToNull(values.planPlace),
    planActivity: emptyToNull(values.planActivity),
    planMapUrl: emptyToNull(values.planMapUrl),
    planDressCode: emptyToNull(values.planDressCode),
    planNotes: emptyToNull(values.planNotes),
    planPhotos: savedPhotos(values.planPhotos, "plan photo"),
    planTitle: emptyToNull(values.planTitle),
    planStops: values.planStops.map(savedStop),
    songUrl: canonicalSongUrl(values.songUrl),
    songStart: values.songStart,
    songLength: values.songLength,
  };
  const lockable = {
    question: values.question,
    timezone: values.timezone,
    allowCustomTime: values.allowCustomTime,
    timeOfDay: values.timeOfDay,
    themeId: values.themeId,
  };

  // "Let them pick" means a calendar and no Time slots: any times still in the
  // form from before switching modes aren't saved.
  const times = (values.allowCustomTime ? [] : values.timeSlots).map((slot) => zonedTimeToUtc(slot.date, slot.time, values.timezone));
  const timeSlots = times.filter((at): at is Date => at !== null);

  return { content: { ...editable, ...lockable }, editable, lockable, timeSlots, allTimesReal: timeSlots.length === times.length };
}

/** A saved Invite as the studio's form values, at `now`. */
export function savedToForm(invite: SavedInvite, now: Date): InviteFormValues {
  const hasUpcomingSlot = invite.timeSlots.some((s) => s.startsAt.getTime() > now.getTime());
  return {
    recipientName: invite.recipientName,
    question: invite.question,
    message: invite.message ?? "",
    imageUrl: invite.imageUrl ?? "",
    planPlace: invite.planPlace ?? "",
    planActivity: invite.planActivity ?? "",
    planMapUrl: invite.planMapUrl ?? "",
    planDressCode: invite.planDressCode ?? "",
    planNotes: invite.planNotes ?? "",
    planPhotos: photoRows(invite.planPhotos),
    planTitle: invite.planTitle ?? "",
    planStops: invite.planStops.map(stopRow),
    songUrl: invite.songUrl ?? "",
    songStart: invite.songStart,
    songLength: invite.songLength,
    timezone: invite.timezone,
    // Older Invites could offer times and a calendar at once; they open as
    // "I'll pick the times" (and keep both for Recipients until saved again).
    // Only upcoming times count: if they've all passed, the calendar is what
    // keeps the Invite answerable, so it opens as "Let them pick".
    allowCustomTime: invite.allowCustomTime && !hasUpcomingSlot,
    timeOfDay: invite.timeOfDay,
    timeSlots: invite.timeSlots.map((s) => utcToZonedParts(s.startsAt, invite.timezone)),
    themeId: invite.themeId,
  };
}

/**
 * The content of a new Invite copied from `source`: every field, with `themeId`
 * (the original's, or a fallback when it's no longer usable). Its old Time slots
 * would be in the past, so the copy has none and lets them pick a time instead,
 * which keeps it sendable as is.
 */
export function copyOfInvite(source: SavedInvite, themeId: string, now: Date): InviteContent {
  return formToSaved({ ...savedToForm(source, now), themeId, allowCustomTime: true, timeSlots: [] }).content;
}

/** What the Recipient would see at `now` once these form values are saved, with no Answer yet. */
export function previewInvite(values: InviteFormValues, now: Date): PublicInvite {
  const { content, timeSlots } = formToSaved(values);
  return toPublicInvite(
    { ...content, slug: "preview", timeSlots: timeSlots.map((startsAt, i) => ({ id: `preview-${i}`, startsAt })) },
    null,
    now,
  );
}
