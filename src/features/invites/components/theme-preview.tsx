"use client";

import { useEffect, useState } from "react";
import { AnswerKind } from "@/lib/enums";
import { zonedTimeToUtc } from "@/lib/time";
import { safeHttpUrl } from "@/lib/validation";
import { TimeChoiceKind } from "../enums";
import type { InviteFormValues } from "../schemas";
import { DEFAULT_THEME_ID, getTheme } from "../themes";
import type { AnswerInput, PublicInvite, SubmitAnswerResult } from "../types";
import { parseQuestion } from "../utils/question";
import { DEFAULT_TIME_OF_DAY } from "../utils/time-of-day";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "./theme-preview-protocol";

/** `exampleQuestion` stands in for an empty question, so the Theme never renders blank. */
function toPreviewInvite(values: InviteFormValues, exampleQuestion: string): PublicInvite {
  const now = Date.now();
  // Same as saving: "Let them pick" shows the calendar and none of the times still in the form.
  const timeSlots = (values.allowCustomTime ? [] : values.timeSlots)
    .map((slot, i) => ({ id: `preview-${i}`, at: zonedTimeToUtc(slot.date, slot.time, values.timezone || "UTC") }))
    .filter((s): s is { id: string; at: Date } => !!s.at && s.at.getTime() > now)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .map((s) => ({ id: s.id, startsAt: s.at.toISOString() }));

  return {
    slug: "preview",
    themeId: values.themeId,
    recipientName: values.recipientName || "them",
    question: parseQuestion(values.question || exampleQuestion),
    message: values.message || null,
    imageUrl: values.imageUrl || null,
    plan: {
      place: values.planPlace || null,
      activity: values.planActivity || null,
      mapUrl: safeHttpUrl(values.planMapUrl),
      dressCode: values.planDressCode || null,
      notes: values.planNotes || null,
      photos: values.planPhotos
        .filter((p) => p.url)
        .map((p) => ({ url: p.url, alt: p.alt || "plan photo", ...(p.caption ? { caption: p.caption } : {}) })),
    },
    timezone: values.timezone || "UTC",
    timeSlots,
    allowCustomTime: values.allowCustomTime,
    timeOfDay: values.timeOfDay ?? DEFAULT_TIME_OF_DAY,
    // The studio's Song picker plays it already; a second player here would play over it.
    song: null,
    answer: null,
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
