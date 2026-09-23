import type { PlanPhoto } from "@/lib/db/schema";

export type { PlanPhoto };

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
};

export type SubmitAnswerInput = {
  date: string;
  time: string;
  note: string | null;
};

export type ActionResult = { error?: string };
