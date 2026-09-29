"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { answers, invites } from "@/lib/db/schema";
import { RateLimit, rateLimitError } from "@/lib/rate-limit";
import { idSchema } from "@/lib/validation";

/**
 * Reopens one of the Creator's Invites: clears its Answer, so the Recipient
 * sees the question again and can answer anew (and the Creator is told again
 * when they do). Only the Creator can do this; the Recipient can't change an
 * Answer. Already open is fine, not an error.
 */
export async function reopenInvite(inviteId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  const limited = await rateLimitError(RateLimit.ReopenInvite, user.id);
  if (limited) return { error: limited };
  if (!idSchema.safeParse(inviteId).success) return { error: "Invite not found." };

  const slug = await db.transaction(async (tx) => {
    // Same lock as saving an Answer, so an Answer can't land halfway through.
    const [locked] = await tx
      .select({ slug: invites.slug })
      .from(invites)
      .where(and(eq(invites.id, inviteId), eq(invites.creatorId, user.id)))
      .for("update");
    if (!locked) return null;
    await tx.delete(answers).where(eq(answers.inviteId, inviteId));
    return locked.slug;
  });
  if (!slug) return { error: "Invite not found." };

  revalidatePath("/dashboard");
  revalidatePath(`/invite/${slug}`);
  return {};
}
