"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { invites } from "@/lib/db/schema";
import { idSchema } from "@/lib/validation";

/** Permanently deletes one of the Creator's Invites, with its Answer and Linked groups. */
export async function deleteInvite(inviteId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (!idSchema.safeParse(inviteId).success) return { error: "Invite not found." };

  const [deleted] = await db
    .delete(invites)
    .where(and(eq(invites.id, inviteId), eq(invites.creatorId, user.id)))
    .returning({ slug: invites.slug });
  if (!deleted) return { error: "Invite not found." };

  revalidatePath("/dashboard");
  revalidatePath(`/invite/${deleted.slug}`);
  return {};
}
