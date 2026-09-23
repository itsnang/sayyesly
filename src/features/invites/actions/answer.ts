"use server";

import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { answers, invites, inviteTimeSlots } from "@/lib/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getInviteForAnswer, toPublicAnswer } from "../server/data";
import { notifyAnswer } from "../server/notify";
import type { SubmitAnswerResult } from "../types";
import { resolveAnswer, type ResolvedAnswer } from "../utils";

const slugSchema = z.string().regex(/^[\w-]{1,40}$/);

/**
 * Saves the Recipient's Answer. One Answer per Invite: a repeat submit (double
 * tap, second device) gets the Answer already on record instead of an error.
 * The Creator viewing their own Invite is a Preview and nothing is saved.
 *
 * The dodge count comes from the Recipient's browser and can't be verified;
 * resolveAnswer only keeps it within 0–999. It's a playful stat, nothing more.
 */
export async function submitAnswer(slug: string, input: unknown): Promise<SubmitAnswerResult> {
  if (!slugSchema.safeParse(slug).success) return { error: "This invite no longer exists." };

  // Per-address and per-invite limits, so spoofing addresses can't flood one invite.
  const ip = clientIp(await headers());
  if (!rateLimit(`answer:ip:${ip}`, 20, 60_000) || !rateLimit(`answer:invite:${slug}`, 30, 60_000)) {
    return { error: "Too many tries. Take a breath and try again in a minute." };
  }

  const invite = await getInviteForAnswer(slug);
  if (!invite) return { error: "This invite no longer exists." };
  if (invite.answer) return { answer: toPublicAnswer(invite.answer) };

  const viewer = await getCurrentUser();
  if (viewer?.id === invite.creatorId) {
    const preview = resolveAnswer(invite, input, new Date());
    if (!preview.ok) return { error: preview.error };
    return { preview: true, answer: toPublicAnswer({ kind: preview.value.answer, ...preview.value }) };
  }

  const outcome = await db.transaction(async (tx): Promise<{ saved: ResolvedAnswer } | { error: string } | null> => {
    // Lock the Invite: saveInvite takes the same lock before touching the question,
    // Time slots or Theme, so an edit and an Answer can never interleave.
    const [locked] = await tx
      .select({ id: invites.id, timezone: invites.timezone, allowCustomTime: invites.allowCustomTime })
      .from(invites)
      .where(eq(invites.id, invite.id))
      .for("update");
    if (!locked) return { error: "This invite no longer exists." };

    // Re-read the Time slots under the lock; the Creator may have just changed them.
    const timeSlots = await tx
      .select({ id: inviteTimeSlots.id, startsAt: inviteTimeSlots.startsAt })
      .from(inviteTimeSlots)
      .where(eq(inviteTimeSlots.inviteId, invite.id))
      .orderBy(asc(inviteTimeSlots.startsAt));

    const resolved = resolveAnswer({ ...locked, timeSlots }, input, new Date());
    if (!resolved.ok) return { error: resolved.error };

    const { answer: kind, ...rest } = resolved.value;
    const [row] = await tx
      .insert(answers)
      .values({ inviteId: invite.id, kind, ...rest })
      .onConflictDoNothing({ target: answers.inviteId })
      .returning({ id: answers.id });
    return row ? { saved: resolved.value } : null;
  });

  if (outcome === null) {
    // Lost a race with another submit; report whichever Answer won.
    const current = await getInviteForAnswer(slug);
    return current?.answer ? { answer: toPublicAnswer(current.answer) } : { error: "Please try again." };
  }
  if ("error" in outcome) return { error: outcome.error };

  after(() => notifyAnswer(invite.id));
  return { answer: toPublicAnswer({ kind: outcome.saved.answer, ...outcome.saved }) };
}
