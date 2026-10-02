"use client";

import { useEffect, useState } from "react";
import { AnswerKind } from "@/lib/enums";
import { zonedTimeToUtc } from "@/lib/time";
import { TimeChoiceKind } from "../enums";
import type { InviteFormValues } from "../schemas";
import { DEFAULT_THEME_ID, getTheme } from "../themes";
import type { AnswerInput, PublicInvite, SubmitAnswerResult } from "../types";
import { previewInvite } from "../utils/invite-content";
import { DEFAULT_TIME_OF_DAY } from "../utils/time-of-day";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "./theme-preview-protocol";

/**
 * What the preview shows: the Invite as it would be once saved, plus the
 * preview's own touches. `exampleQuestion` stands in for an empty question, so
 * the Theme never renders blank; mid-edit gaps (no name, no time zone) get stand-ins.
 */
function toPreviewInvite(values: InviteFormValues, exampleQuestion: string): PublicInvite {
  const invite = previewInvite(
    {
      ...values,
      question: values.question || exampleQuestion,
      timezone: values.timezone || "UTC",
      timeOfDay: values.timeOfDay ?? DEFAULT_TIME_OF_DAY,
    },
    new Date(),
  );
  return {
    ...invite,
    recipientName: values.recipientName || "them",
    // The studio's Song picker plays it already; a second player here would play over it.
    song: null,
    expired: false,
  };
}

/**
 * Renders a Theme from unsaved form values. Nothing is saved or sent. Without
 * `fixedValues` it waits for values posted from the invite editor (iframe mode).
 */
export function ThemePreview({ fixedValues }: { fixedValues?: InviteFormValues }) {
  const [values, setValues] = useState<InviteFormValues | null>(fixedValues ?? null);

  useEffect(() => {
    if (fixedValues) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== PREVIEW_MESSAGE) return;
      setValues(e.data.values as InviteFormValues);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [fixedValues]);

  if (!values) return null;
  const theme = getTheme(values.themeId) ?? getTheme(DEFAULT_THEME_ID);
  if (!theme) return null;
  const invite = toPreviewInvite(values, theme.content.example.question);

  async function submitAnswer(input: AnswerInput): Promise<SubmitAnswerResult> {
    if (input.answer === AnswerKind.MaybeLater) return { preview: true, answer: { answer: AnswerKind.MaybeLater, startsAt: null, note: null } };
    const startsAt =
      input.choice.kind === TimeChoiceKind.Slot
        ? invite.timeSlots.find((s) => s.id === (input.choice as { timeSlotId: string }).timeSlotId)?.startsAt ?? null
        : zonedTimeToUtc(input.choice.date, input.choice.time, invite.timezone)?.toISOString() ?? null;
    return { preview: true, answer: { answer: AnswerKind.Yes, startsAt, note: input.note?.trim() || null } };
  }

  // Remount when the theme changes so each theme starts from its first screen.
  return <theme.Invite key={invite.themeId} invite={invite} submitAnswer={submitAnswer} />;
}
