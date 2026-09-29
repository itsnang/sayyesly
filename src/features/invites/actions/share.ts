"use server";

import { and, asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { invites, linkedGroups } from "@/lib/db/schema";
import { RateLimit, rateLimitError } from "@/lib/rate-limit";
import { isId } from "@/lib/validation";
import type { ShareState } from "../types";

/**
 * Where an Invite's Answer will be sent: the Creator's DM (if the bot may
 * message them) and its Linked groups. Both change in Telegram, outside the
 * app, so the Share drawer re-reads this when the tab comes back into view.
 */
export async function getShareState(inviteId: string): Promise<ShareState & { error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again.", canDm: false, linkedGroups: [] };
  const limited = await rateLimitError(RateLimit.ShareState, user.id);
  if (limited) return { error: limited, canDm: false, linkedGroups: [] };
  if (!isId(inviteId)) return { error: "Invite not found.", canDm: false, linkedGroups: [] };

  const invite = await db.query.invites.findFirst({
    where: and(eq(invites.id, inviteId), eq(invites.creatorId, user.id)),
    columns: { id: true },
    with: { linkedGroups: { columns: { id: true, chatTitle: true }, orderBy: asc(linkedGroups.createdAt) } },
  });
  if (!invite) return { error: "Invite not found.", canDm: false, linkedGroups: [] };

  return { canDm: user.canDm, linkedGroups: invite.linkedGroups.map((g) => ({ id: g.id, title: g.chatTitle })) };
}
