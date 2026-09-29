"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { answers, invites } from "@/lib/db/schema";

const slugSchema = z.string().regex(/^[\w-]{1,40}$/);

/**
 * Whether the Invite still has an Answer. An open Invite page asks when it
 * comes back into view, so one the Creator has Reopened goes back to its first
 * screen. Reveals nothing the page doesn't already show.
 */
export async function isInviteAnswered(slug: string): Promise<boolean> {
  if (!slugSchema.safeParse(slug).success) return false;
  const [row] = await db
    .select({ id: answers.id })
    .from(answers)
    .innerJoin(invites, eq(invites.id, answers.inviteId))
    .where(eq(invites.slug, slug));
  return !!row;
}
