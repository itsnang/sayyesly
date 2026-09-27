import type { PlanPhoto } from "@/lib/db/schema";
import type { TimeOfDay } from "@/lib/time/time-of-day";
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
  answer: "yes" | "maybe_later";
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
