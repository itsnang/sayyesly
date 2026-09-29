// Every analytics event and the only properties it may carry: a Theme id, an
// Answer kind or which button. Never free text (names, questions, notes).
// Adding an event here is the whole change; a typo elsewhere fails typecheck.

import type { AnswerKind, EnumValue } from "@/lib/enums";

type NoProps = Record<string, never>;

/** Which "Make an invite" button on the landing page was clicked. */
export const CtaLocation = { Hero: "hero", Nav: "nav", Pricing: "pricing", Scrapbook: "scrapbook", Studio: "studio", Closing: "closing" } as const;
export type CtaLocation = EnumValue<typeof CtaLocation>;

export type AnalyticsEvents = {
  make_invite_clicked: { location: CtaLocation };
  demo_opened: { theme: string };
  login_started: NoProps;
  invite_created: { theme: string };
  link_copied: NoProps;
  invite_opened: { theme: string };
  invite_answered: { kind: AnswerKind };
  /** The Creator cleared an Answer so the Recipient can answer again; `kind` is the Answer cleared */
  invite_reopened: { theme: string; kind: AnswerKind };
  checkout_opened: { theme: string };
  theme_paid: { theme: string };
};

export type AnalyticsEvent = keyof AnalyticsEvents;

/** The props argument, optional for events that take none. */
export type PropsArg<E extends AnalyticsEvent> = AnalyticsEvents[E] extends NoProps ? [] : [AnalyticsEvents[E]];
