import "server-only";
import { asc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/lib/db";
import { invites, inviteTimeSlots } from "@/lib/db/schema";
import type { PublicInvite } from "./types";
import { parseQuestion } from "./utils";

/** The Invite as the Recipient may see it, or null if it doesn't exist. Cached per request. */
export const getPublicInvite = cache(async (slug: string): Promise<PublicInvite | null> => {
  // Invites change and Time slots expire, so never prerender this at build time.
  await connection();

  const invite = await db.query.invites.findFirst({
    where: eq(invites.slug, slug),
    with: { timeSlots: { orderBy: asc(inviteTimeSlots.startsAt) } },
  });
  if (!invite) return null;

  const now = Date.now();
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
      .filter((slot) => slot.startsAt.getTime() > now)
      .map((slot) => ({ id: slot.id, startsAt: slot.startsAt.toISOString() })),
    allowCustomTime: invite.allowCustomTime,
  };
});
