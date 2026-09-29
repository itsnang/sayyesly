import { AnswerKind, type EnumValue } from "@/lib/enums";

/** How the Recipient chose a time when saying Yes: one of the Time slots, or a Custom time. */
export const TimeChoiceKind = { Slot: "slot", Custom: "custom" } as const;
export type TimeChoiceKind = EnumValue<typeof TimeChoiceKind>;

/** The studio's collapsible settings sections. */
export const StudioSection = { Plan: "plan", When: "when", Extras: "extras" } as const;
export type StudioSection = EnumValue<typeof StudioSection>;

/** What the studio previews the Invite on. Remembered between visits, so the values must not change. */
export const PreviewDevice = { Phone: "phone", Desktop: "desktop" } as const;
export type PreviewDevice = EnumValue<typeof PreviewDevice>;

/** Where an Invite stands in the Creator's list: its Answer, or why there isn't one yet. */
export const InviteStatus = { ...AnswerKind, Expired: "expired", Waiting: "waiting" } as const;
export type InviteStatus = EnumValue<typeof InviteStatus>;
