"use client";

import { useEffect, useState } from "react";
import { zonedTimeToUtc } from "@/lib/time";
import type { InviteFormValues } from "../schemas";
import { DEFAULT_THEME_ID, getTheme } from "../themes";
import type { AnswerInput, PublicInvite, SubmitAnswerResult } from "../types";
import { parseQuestion } from "../utils/question";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "./theme-preview-protocol";

function toPreviewInvite(values: InviteFormValues): PublicInvite {
  const now = Date.now();
  const timeSlots = values.timeSlots
    .map((slot, i) => ({ id: `preview-${i}`, at: zonedTimeToUtc(slot.date, slot.time, values.timezone || "UTC") }))
    .filter((s): s is { id: string; at: Date } => !!s.at && s.at.getTime() > now)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .map((s) => ({ id: s.id, startsAt: s.at.toISOString() }));

  return {
    slug: "preview",
    themeId: values.themeId,
    recipientName: values.recipientName || "them",
    question: parseQuestion(values.question || "will you have *dinner* with me?"),
    message: values.message || null,
    imageUrl: values.imageUrl || null,
    plan: {
      place: values.planPlace || null,
      activity: values.planActivity || null,
      mapUrl: values.planMapUrl || null,
      dressCode: values.planDressCode || null,
      notes: values.planNotes || null,
      photos: values.planPhotos
        .filter((p) => p.url)
        .map((p) => ({ url: p.url, alt: p.alt || "date plan photo", ...(p.caption ? { caption: p.caption } : {}) })),
    },
    timezone: values.timezone || "UTC",
    timeSlots,
    // With nothing chosen yet, still let the preview show the calendar.
    allowCustomTime: values.allowCustomTime || timeSlots.length === 0,
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
  const invite = toPreviewInvite(values);
  const theme = getTheme(invite.themeId) ?? getTheme(DEFAULT_THEME_ID);
  if (!theme) return null;

  async function submitAnswer(input: AnswerInput): Promise<SubmitAnswerResult> {
    if (input.answer === "maybe_later") return { preview: true, answer: { answer: "maybe_later", startsAt: null, note: null } };
    const startsAt =
      input.choice.kind === "slot"
        ? invite.timeSlots.find((s) => s.id === (input.choice as { timeSlotId: string }).timeSlotId)?.startsAt ?? null
        : zonedTimeToUtc(input.choice.date, input.choice.time, invite.timezone)?.toISOString() ?? null;
    return { preview: true, answer: { answer: "yes", startsAt, note: input.note?.trim() || null } };
  }

  // Remount when the theme changes so each theme starts from its first screen.
  return <theme.Invite key={invite.themeId} invite={invite} submitAnswer={submitAnswer} />;
}
