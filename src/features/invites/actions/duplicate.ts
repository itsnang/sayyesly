"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { invites } from "@/lib/db/schema";
import { RateLimit, rateLimitError } from "@/lib/rate-limit";
import { idSchema } from "@/lib/validation";
import { canUseTheme } from "../server/theme-choices";
import { DEFAULT_THEME_ID } from "../themes";
import { newInviteSlug, newLinkCode } from "../utils";
import { copyOfInvite } from "../utils/invite-content";

type DuplicateResult = { error?: string; id?: string; /** The copy uses the free Theme; the original one is no longer usable */ themeSwapped?: boolean };

/**
 * Copies one of the Creator's Invites into a brand-new one: same question,
 * Plan and Theme, but a fresh link, no Time slots (the old ones would be in
 * the past) and no Answer. The original Invite is untouched: this makes a new
 * Invite with its own link, for sending to someone else (to ask the same
 * Recipient again on the same link, reopen it instead).
 */
export async function duplicateInvite(inviteId: string): Promise<DuplicateResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  const limited = await rateLimitError(RateLimit.DuplicateInvite, user.id);
  if (limited) return { error: limited };
  if (!idSchema.safeParse(inviteId).success) return { error: "Invite not found." };

  const source = await db.query.invites.findFirst({
    where: and(eq(invites.id, inviteId), eq(invites.creatorId, user.id)),
  });
  if (!source) return { error: "Invite not found." };

  // Still owns a Paid theme it once used unless something's changed underneath; fall back rather
  // than fail, but say so in the result, since "same theme" silently becoming a different one
  // would otherwise be invisible to the Creator.
  const stillOwns = await canUseTheme(user.id, source.themeId);
  const themeId = stillOwns ? source.themeId : DEFAULT_THEME_ID;

  const [created] = await db
    .insert(invites)
    .values({
      creatorId: user.id,
      slug: newInviteSlug(),
      linkCode: newLinkCode(),
      // Its old Time slots stay behind; the copy lets them pick a time instead.
      ...copyOfInvite({ ...source, timeSlots: [] }, themeId, new Date()),
    })
    .returning({ id: invites.id });
  if (!created) return { error: "Couldn't duplicate. Please try again." };

  revalidatePath("/dashboard");
  return { id: created.id, themeSwapped: !stillOwns };
}
