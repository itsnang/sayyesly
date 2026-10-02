import { z } from "zod";
import { AnswerKind } from "@/lib/enums";
import { zonedTimeToUtc } from "@/lib/time";
import { TimeChoiceKind } from "../enums";

/** What the answer rules need to know about an Invite. */
export type AnswerableInvite = {
  timezone: string;
  allowCustomTime: boolean;
  timeSlots: { id: string; startsAt: Date }[];
};

/** An Answer checked against its Invite, ready to save (fields named as the database names them). */
export type ResolvedAnswer = {
  kind: AnswerKind;
  timeSlotId: string | null;
  startsAt: Date | null;
  note: string | null;
  noDodges: number;
};

export type AnswerResult = { ok: true; value: ResolvedAnswer } | { ok: false; error: string };

export const NOTE_MAX_LENGTH = 500;
const MAX_DODGES = 999;

const noteSchema = z
  .string()
  .trim()
  .max(NOTE_MAX_LENGTH)
  .nullable()
  .transform((note) => (note ? note : null));

const noDodgesSchema = z
  .number()
  .int()
  .transform((n) => Math.min(Math.max(n, 0), MAX_DODGES));

const answerInputSchema = z.discriminatedUnion("answer", [
  z.object({
    answer: z.literal(AnswerKind.Yes),
    choice: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal(TimeChoiceKind.Slot), timeSlotId: z.string().max(64) }),
      z.object({ kind: z.literal(TimeChoiceKind.Custom), date: z.string().max(10), time: z.string().max(5) }),
    ]),
    note: noteSchema,
    noDodges: noDodgesSchema,
  }),
  z.object({
    answer: z.literal(AnswerKind.MaybeLater),
    note: noteSchema,
    noDodges: noDodgesSchema,
  }),
]);

/** The Answer as the browser sends it. Untrusted: always goes through `resolveAnswer`. */
export type AnswerInput = z.input<typeof answerInputSchema>;

/** An Invite is Expired when every Time slot has passed and no Custom time is allowed. */
export function isExpired(invite: Pick<AnswerableInvite, "allowCustomTime" | "timeSlots">, now: Date): boolean {
  return !invite.allowCustomTime && invite.timeSlots.every((s) => s.startsAt.getTime() <= now.getTime());
}

/** Validates a Recipient's raw Answer against the Invite and turns it into what gets saved. */
export function resolveAnswer(invite: AnswerableInvite, raw: unknown, now: Date): AnswerResult {
  if (isExpired(invite, now)) return { ok: false, error: "This invite has expired." };
  const parsed = answerInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "That answer doesn't look right." };
  const input = parsed.data;
  if (input.answer === AnswerKind.MaybeLater) {
    return {
      ok: true,
      value: { kind: AnswerKind.MaybeLater, timeSlotId: null, startsAt: null, note: input.note, noDodges: input.noDodges },
    };
  }
  const { choice } = input;

  if (choice.kind === TimeChoiceKind.Custom) {
    if (!invite.allowCustomTime) return { ok: false, error: "Please pick one of the offered times." };
    const startsAt = zonedTimeToUtc(choice.date, choice.time, invite.timezone);
    if (!startsAt) return { ok: false, error: "That date doesn't look right." };
    if (startsAt.getTime() <= now.getTime()) return { ok: false, error: "That time has already passed." };
    return {
      ok: true,
      value: { kind: AnswerKind.Yes, timeSlotId: null, startsAt, note: input.note, noDodges: input.noDodges },
    };
  }

  const slot = invite.timeSlots.find((s) => s.id === choice.timeSlotId);
  if (!slot) return { ok: false, error: "That time isn't one of the options." };
  if (slot.startsAt.getTime() <= now.getTime()) return { ok: false, error: "That time has already passed." };
  return {
    ok: true,
    value: {
      kind: AnswerKind.Yes,
      timeSlotId: slot.id,
      startsAt: slot.startsAt,
      note: input.note,
      noDodges: input.noDodges,
    },
  };
}
