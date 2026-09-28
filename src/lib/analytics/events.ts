// Every analytics event and the only properties it may carry: a Theme id, an
// Answer kind or which button. Never free text (names, questions, notes).
// Adding an event here is the whole change; a typo elsewhere fails typecheck.

type NoProps = Record<string, never>;

export type CtaLocation = "hero" | "nav" | "pricing" | "scrapbook" | "studio" | "closing";

export type AnalyticsEvents = {
  make_invite_clicked: { location: CtaLocation };
  demo_opened: { theme: string };
  login_started: NoProps;
  invite_created: { theme: string };
  link_copied: NoProps;
  invite_opened: { theme: string };
  invite_answered: { kind: "yes" | "maybe_later" };
  checkout_opened: { theme: string };
  theme_paid: { theme: string };
};

export type AnalyticsEvent = keyof AnalyticsEvents;

/** The props argument, optional for events that take none. */
export type PropsArg<E extends AnalyticsEvent> = AnalyticsEvents[E] extends NoProps ? [] : [AnalyticsEvents[E]];
