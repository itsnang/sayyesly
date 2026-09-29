"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { answers, invites } from "@/lib/db/schema";
import { allow, clientIp, RateLimit } from "@/lib/rate-limit";

const slugSchema = z.string().regex(/^[\w-]{1,40}$/);

/**
 * Whether the Invite still has an Answer. An open Invite page asks when it
 * comes back into view, so one the Creator has Reopened goes back to its first
 * screen. Reveals nothing the page doesn't already show. When the address has
 * asked too often it answers "still answered", which changes nothing on the page.
 */
export async function isInviteAnswered(slug: string): Promise<boolean> {
  if (!slugSchema.safeParse(slug).success) return false;
  if (!(await allow(RateLimit.AnswerCheckByIp, clientIp(await headers())))) return true;
  const [row] = await db
    .select({ id: answers.id })
    .from(answers)
    .innerJoin(invites, eq(invites.id, answers.inviteId))
    .where(eq(invites.slug, slug));
  return !!row;
}
