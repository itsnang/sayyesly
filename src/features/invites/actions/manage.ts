"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { invites, inviteTimeSlots, type NewInvite } from "@/lib/db/schema";
import { zonedTimeToUtc } from "@/lib/time";
import { inviteFormSchema, type InviteFormValues } from "../schemas";
import { canUseTheme } from "../theme-access";
import { newInviteSlug, newLinkCode } from "../utils";

type SaveResult = { error?: string; id?: string };

const orNull = (v: string) => (v === "" ? null : v);

/**
 * Creates (`inviteId` null) or updates one of the Creator's Invites. Once the
 * Invite has an Answer, only the Plan and the wording around it can change:
 * the question, Time slots, time zone, Custom time and Theme are locked.
 */
export async function saveInvite(inviteId: string | null, input: InviteFormValues): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };

  const parsed = inviteFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const values = parsed.data;

  const existing = inviteId
    ? await db.query.invites.findFirst({
        where: and(eq(invites.id, inviteId), eq(invites.creatorId, user.id)),
        with: { response: { columns: { id: true } } },
      })
    : null;
  if (inviteId && !existing) return { error: "Invite not found." };
  const locked = !!existing?.response;

  // Keeping the Theme an Invite already has is always fine; switching needs access.
  if (existing?.themeId !== values.themeId && !(await canUseTheme(user.id, values.themeId))) {
    return { error: "That theme isn't unlocked yet." };
  }

  const editable = {
    recipientName: values.recipientName,
    message: orNull(values.message),
    imageUrl: orNull(values.imageUrl),
    planPlace: orNull(values.planPlace),
    planActivity: orNull(values.planActivity),
    planMapUrl: orNull(values.planMapUrl),
    planDressCode: orNull(values.planDressCode),
    planNotes: orNull(values.planNotes),
    planPhotos: values.planPhotos.map((p) => ({
      url: p.url,
      alt: p.alt || "date plan photo",
      ...(p.caption ? { caption: p.caption } : {}),
    })),
  } satisfies Partial<NewInvite>;

  const slotTimes: Date[] = [];
  if (!locked) {
    const now = Date.now();
    for (const slot of values.timeSlots) {
      const at = zonedTimeToUtc(slot.date, slot.time, values.timezone);
      if (!at) return { error: "One of the times isn't a real date." };
      if (at.getTime() <= now) return { error: "Times you offer need to be in the future." };
      slotTimes.push(at);
    }
  }

  const lockable = {
    question: values.question,
    timezone: values.timezone,
    allowCustomTime: values.allowCustomTime,
    themeId: values.themeId,
  } satisfies Partial<NewInvite>;

  let id: string;
  let slug: string;
  if (!existing) {
    const created = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(invites)
        .values({ ...editable, ...lockable, creatorId: user.id, slug: newInviteSlug(), linkCode: newLinkCode() })
        .returning({ id: invites.id, slug: invites.slug });
      if (!row) throw new Error("Invite insert returned nothing");
      if (slotTimes.length > 0) {
        await tx.insert(inviteTimeSlots).values(slotTimes.map((startsAt) => ({ inviteId: row.id, startsAt })));
      }
      return row;
    });
    ({ id, slug } = created);
  } else {
    await db.transaction(async (tx) => {
      await tx
        .update(invites)
        .set({ ...editable, ...(locked ? {} : lockable), updatedAt: new Date() })
        .where(and(eq(invites.id, existing.id), eq(invites.creatorId, user.id)));
      if (!locked) {
        await tx.delete(inviteTimeSlots).where(eq(inviteTimeSlots.inviteId, existing.id));
        if (slotTimes.length > 0) {
          await tx.insert(inviteTimeSlots).values(slotTimes.map((startsAt) => ({ inviteId: existing.id, startsAt })));
        }
      }
    });
    ({ id, slug } = existing);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/i/${slug}`);
  return { id };
}

/** Permanently deletes one of the Creator's Invites, with its Answer and Linked groups. */
export async function deleteInvite(inviteId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };

  const [deleted] = await db
    .delete(invites)
    .where(and(eq(invites.id, inviteId), eq(invites.creatorId, user.id)))
    .returning({ slug: invites.slug });
  if (!deleted) return { error: "Invite not found." };

  revalidatePath("/dashboard");
  revalidatePath(`/i/${deleted.slug}`);
  return {};
}
