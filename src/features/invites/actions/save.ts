"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { answers, invites, inviteTimeSlots } from "@/lib/db/schema";
import { RateLimit, rateLimitError } from "@/lib/rate-limit";
import { idSchema } from "@/lib/validation";
import type { InviteFormValues } from "../schemas";
import { readInviteForm } from "../server/invite-form";
import { canUseTheme } from "../server/theme-choices";
import { newInviteSlug, newLinkCode } from "../utils";
import { formToSaved } from "../utils/invite-content";
import { diffTimeSlots } from "../utils/time-slots";

type SaveResult = {
  error?: string;
  id?: string;
  /** The Invite has an Answer, so only the Plan and the wording around it were saved */
  answered?: boolean;
};

const PAST_ERROR = { error: "Times you add need to be in the future." };

/**
 * Creates (`inviteId` null) or updates one of the Creator's Invites. Once the
 * Invite has an Answer, only the Plan and the wording around it can change:
 * the question, Time slots, time zone, Custom time and Theme are locked.
 */
export async function saveInvite(inviteId: string | null, input: InviteFormValues): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  const limited = await rateLimitError(RateLimit.SaveInvite, user.id);
  if (limited) return { error: limited };
  if (inviteId !== null && !idSchema.safeParse(inviteId).success) return { error: "Invite not found." };

  const form = readInviteForm(input);
  if (!form.ok) return { error: form.error };
  const { values } = form;

  const existing = inviteId
    ? await db.query.invites.findFirst({
        where: and(eq(invites.id, inviteId), eq(invites.creatorId, user.id)),
        columns: { id: true, slug: true, themeId: true },
      })
    : null;
  if (inviteId && !existing) return { error: "Invite not found." };

  // Keeping the Theme an Invite already has is always fine; switching needs access.
  if (existing?.themeId !== values.themeId && !(await canUseTheme(user.id, values.themeId))) {
    return { error: "That theme isn't unlocked yet." };
  }

  const { editable, lockable, timeSlots: wanted, allTimesReal } = formToSaved(values);
  if (!allTimesReal) return { error: "One of the times isn't a real date." };
  const now = Date.now();

  if (!existing) {
    const slots = diffTimeSlots([], wanted, now);
    if (!slots.ok) return PAST_ERROR;
    const created = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(invites)
        .values({ ...editable, ...lockable, creatorId: user.id, slug: newInviteSlug(), linkCode: newLinkCode() })
        .returning({ id: invites.id });
      if (row && slots.add.length > 0) {
        await tx.insert(inviteTimeSlots).values(slots.add.map((startsAt) => ({ inviteId: row.id, startsAt })));
      }
      return row ?? null;
    });
    if (!created) return { error: "Couldn't save. Please try again." };
    revalidatePath("/dashboard");
    return { id: created.id };
  }

  const result = await db.transaction(async (tx): Promise<SaveResult> => {
    // Same lock submitAnswer takes: "is it answered?" is decided while no Answer can land.
    const [locked] = await tx
      .select({ id: invites.id })
      .from(invites)
      .where(and(eq(invites.id, existing.id), eq(invites.creatorId, user.id)))
      .for("update");
    if (!locked) return { error: "Invite not found." };

    const [answered] = await tx.select({ id: answers.id }).from(answers).where(eq(answers.inviteId, existing.id));

    if (!answered) {
      const current = await tx
        .select({ id: inviteTimeSlots.id, startsAt: inviteTimeSlots.startsAt })
        .from(inviteTimeSlots)
        .where(eq(inviteTimeSlots.inviteId, existing.id));
      const slots = diffTimeSlots(current, wanted, now);
      if (!slots.ok) return PAST_ERROR;
      if (slots.remove.length > 0) await tx.delete(inviteTimeSlots).where(inArray(inviteTimeSlots.id, slots.remove));
      if (slots.add.length > 0) {
        await tx.insert(inviteTimeSlots).values(slots.add.map((startsAt) => ({ inviteId: existing.id, startsAt })));
      }
    }

    await tx
      .update(invites)
      .set({ ...editable, ...(answered ? {} : lockable), updatedAt: new Date() })
      .where(eq(invites.id, existing.id));
    // Tell the editor, which may not know yet: they can answer while it's open.
    return answered ? { id: existing.id, answered: true } : { id: existing.id };
  });
  if (result.error) return result;

  revalidatePath("/dashboard");
  revalidatePath(`/invite/${existing.slug}`);
  return result;
}
