import "server-only";
import { asc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/lib/db";
import { invites, inviteTimeSlots, type AnswerRow } from "@/lib/db/schema";
import type { PublicAnswer, PublicInvite } from "../types";
import { isExpired, parseQuestion } from "../utils";

export function toPublicAnswer(answer: Pick<AnswerRow, "kind" | "startsAt" | "note">): PublicAnswer {
  return {
    answer: answer.kind,
    startsAt: answer.startsAt?.toISOString() ?? null,
    note: answer.note,
  };
}

/** The Invite with what answering needs: Time slots, the Answer and the Creator. */
export async function getInviteForAnswer(slug: string) {
  return db.query.invites.findFirst({
    where: eq(invites.slug, slug),
    with: {
      timeSlots: { orderBy: asc(inviteTimeSlots.startsAt) },
      answer: true,
      creator: true,
    },
  });
}

/** The Invite as the Recipient may see it, or null if it doesn't exist. Cached per request. */
export const getPublicInvite = cache(async (slug: string): Promise<PublicInvite | null> => {
  // Invites change and Time slots expire, so never prerender this at build time.
  await connection();

  const invite = await db.query.invites.findFirst({
    where: eq(invites.slug, slug),
    with: { timeSlots: { orderBy: asc(inviteTimeSlots.startsAt) }, answer: true },
  });
  if (!invite) return null;

  const now = new Date();
  return {
    slug: invite.slug,
    themeId: invite.themeId,
    recipientName: invite.recipientName,
    question: parseQuestion(invite.question),
    message: invite.message,
    imageUrl: invite.imageUrl,
    plan: {
      place: invite.planPlace,
      activity: invite.planActivity,
      mapUrl: invite.planMapUrl,
      dressCode: invite.planDressCode,
      notes: invite.planNotes,
      photos: invite.planPhotos,
    },
    timezone: invite.timezone,
    timeSlots: invite.timeSlots
      .filter((slot) => slot.startsAt.getTime() > now.getTime())
      .map((slot) => ({ id: slot.id, startsAt: slot.startsAt.toISOString() })),
    allowCustomTime: invite.allowCustomTime,
    answer: invite.answer ? toPublicAnswer(invite.answer) : null,
    expired: !invite.answer && isExpired(invite, now),
  };
});

/** The Invite's creator id, for checking whether the viewer is previewing their own Invite. */
export const getInviteCreatorId = cache(async (slug: string): Promise<string | null> => {
  const row = await db.query.invites.findFirst({
    where: eq(invites.slug, slug),
    columns: { creatorId: true },
  });
  return row?.creatorId ?? null;
});
