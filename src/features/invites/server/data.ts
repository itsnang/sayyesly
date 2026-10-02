import "server-only";
import { asc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/lib/db";
import { invites, inviteTimeSlots } from "@/lib/db/schema";
import type { PublicInvite } from "../types";
import { toPublicInvite } from "../utils/invite-content";

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

  return toPublicInvite(invite, invite.answer ?? null, new Date());
});

/** The Invite's creator id, for checking whether the viewer is previewing their own Invite. */
export const getInviteCreatorId = cache(async (slug: string): Promise<string | null> => {
  const row = await db.query.invites.findFirst({
    where: eq(invites.slug, slug),
    columns: { creatorId: true },
  });
  return row?.creatorId ?? null;
});
