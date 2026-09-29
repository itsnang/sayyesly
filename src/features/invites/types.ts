import type { SongClip } from "./utils/song";
import type { PlanPhoto } from "@/lib/db/schema";
import type { AnswerKind, TimeOfDay } from "@/lib/enums";
import type { AnswerInput } from "./utils/answer";

export type { PlanPhoto, AnswerInput };

/** One piece of an Invite's question; `emphasis` marks the *highlighted* word(s). */
export type QuestionSegment = { text: string; emphasis: boolean };

export type Plan = {
  place: string | null;
  activity: string | null;
  mapUrl: string | null;
  dressCode: string | null;
  notes: string | null;
  photos: PlanPhoto[];
};

export type TimeSlot = {
  id: string;
  /** ISO 8601 instant */
  startsAt: string;
};

/** A saved Answer, as the Recipient may see it again. */
export type PublicAnswer = {
  answer: AnswerKind;
  /** ISO 8601 instant; null for maybe_later */
  startsAt: string | null;
  note: string | null;
};

/** Everything a Theme may show to the Recipient. Contains nothing secret. */
export type PublicInvite = {
  slug: string;
  themeId: string;
  recipientName: string;
  question: QuestionSegment[];
  message: string | null;
  imageUrl: string | null;
  plan: Plan;
  /** IANA zone the Time slots are shown in */
  timezone: string;
  /** Only Time slots that haven't passed yet */
  timeSlots: TimeSlot[];
  allowCustomTime: boolean;
  /** Sets the times a Recipient can tap when picking their own */
  timeOfDay: TimeOfDay;
  /** The Song and the part of it that plays, already recognised; null when there's none */
  song: SongClip | null;
  /** The Answer, once given; themes show it instead of asking again */
  answer: PublicAnswer | null;
  expired: boolean;
};

export type SubmitAnswerResult = {
  error?: string;
  /** The Answer now on record: the one just saved, or the earlier one on a repeat submit */
  answer?: PublicAnswer;
  /** True when the Creator is previewing their own Invite and nothing was saved */
  preview?: boolean;
};

export type ActionResult = { error?: string };

/** Where an Invite's Answer will be sent, as the Share drawer shows it. */
export type ShareState = {
  canDm: boolean;
  linkedGroups: { id: string; title: string | null }[];
};

/** What the studio shows for a pasted Song: its title, channel and cover, from YouTube. */
export type SongDetails = {
  title: string;
  /** The YouTube channel, usually the artist */
  by: string | null;
  coverUrl: string | null;
};
