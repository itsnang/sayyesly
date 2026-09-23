"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { invites } from "@/lib/db/schema";
import { escapeHtml, sendMessage } from "@/lib/telegram";
import type { ActionResult, SubmitAnswerInput } from "../types";

const submitAnswerSchema = z.object({
  date: z.string().trim().min(1).max(40),
  time: z.string().trim().min(1).max(20),
  note: z.string().trim().max(500).nullable(),
});

/**
 * Phase 1 stand-in for the answer flow: tells the Creator on Telegram, exactly
 * like the old /api/telegram route did, but with the place and map link read
 * from the database instead of trusted from the browser. Phase 2 replaces this
 * with saving the Answer.
 */
export async function submitAnswer(slug: string, input: SubmitAnswerInput): Promise<ActionResult> {
  const parsed = submitAnswerSchema.safeParse(input);
  if (!parsed.success) return { error: "That answer doesn't look right." };

  const invite = await db.query.invites.findFirst({
    where: eq(invites.slug, slug),
    with: { creator: true },
  });
  if (!invite) return { error: "This invite no longer exists." };
  if (!invite.creator.canDm) return {};

  const { date, time, note } = parsed.data;
  const lines = [
    `♥ <b>${escapeHtml(invite.recipientName)} said yes!</b>`,
    ``,
    `📅 <b>${escapeHtml(date)}</b>  ·  ${escapeHtml(time)}`,
  ];
  if (invite.planPlace) lines.push(`📍 ${escapeHtml(invite.planPlace)}`);
  if (invite.planMapUrl) lines.push(`🗺 ${escapeHtml(invite.planMapUrl)}`);
  if (note) lines.push(``, `💬 <i>"${escapeHtml(note)}"</i>`);
  lines.push(``, `<i>// ${escapeHtml(invite.recipientName)} said yes 🌷</i>`);

  const sent = await sendMessage(invite.creator.telegramId, lines.join("\n"), { parseMode: "HTML" });
  if (!sent.ok) console.error("Answer notification failed", sent.status, sent.description);

  // The Recipient's celebration shouldn't depend on Telegram being reachable.
  return {};
}
