"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { responses } from "@/lib/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getInviteForAnswer, toPublicAnswer } from "../data";
import { notifyAnswer } from "../notify";
import type { SubmitAnswerResult } from "../types";
import { resolveAnswer } from "../utils";

/**
 * Saves the Recipient's Answer. One Answer per Invite: a repeat submit (double
 * tap, second device) gets the Answer already on record instead of an error.
 * The Creator viewing their own Invite is a Preview and nothing is saved.
 */
export async function submitAnswer(slug: string, input: unknown): Promise<SubmitAnswerResult> {
  const ip = clientIp(await headers());
  if (!rateLimit(`answer:${ip}`, 20, 60_000)) {
    return { error: "Too many tries. Take a breath and try again in a minute." };
  }

  const invite = await getInviteForAnswer(slug);
  if (!invite) return { error: "This invite no longer exists." };
  if (invite.response) return { answer: toPublicAnswer(invite.response) };

  const resolved = resolveAnswer(invite, input, new Date());
  if (!resolved.ok) return { error: resolved.error };

  const viewer = await getCurrentUser();
  if (viewer?.id === invite.creatorId) {
    return {
      preview: true,
      answer: {
        answer: resolved.value.answer,
        startsAt: resolved.value.startsAt?.toISOString() ?? null,
        note: resolved.value.note,
      },
    };
  }

  const [saved] = await db
    .insert(responses)
    .values({ inviteId: invite.id, ...resolved.value })
    .onConflictDoNothing({ target: responses.inviteId })
    .returning();

  if (!saved) {
    // Lost a race with another submit; report whichever Answer won.
    const current = await getInviteForAnswer(slug);
    return current?.response ? { answer: toPublicAnswer(current.response) } : { error: "Please try again." };
  }

  after(() => notifyAnswer(invite.id));
  return { answer: toPublicAnswer(saved) };
}
