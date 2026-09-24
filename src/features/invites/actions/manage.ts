"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { answers, invites, inviteTimeSlots, type NewInvite } from "@/lib/db/schema";
import { zonedTimeToUtc } from "@/lib/time";
import { idSchema } from "@/lib/validation";
import { inviteFormSchema, type InviteFormValues } from "../schemas";
import { canUseTheme } from "../server/theme-access";
import { DEFAULT_THEME_ID } from "../themes";
import { newInviteSlug, newLinkCode } from "../utils";

type SaveResult = { error?: string; id?: string };
type DuplicateResult = { error?: string; id?: string; /** The copy uses the free Theme; the original one is no longer usable */ themeSwapped?: boolean };

const emptyToNull = (v: string) => (v === "" ? null : v);

/**
 * Creates (`inviteId` null) or updates one of the Creator's Invites. Once the
 * Invite has an Answer, only the Plan and the wording around it can change:
 * the question, Time slots, time zone, Custom time and Theme are locked.
 */
export async function saveInvite(inviteId: string | null, input: InviteFormValues): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };

  if (inviteId !== null && !idSchema.safeParse(inviteId).success) return { error: "Invite not found." };
  const parsed = inviteFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const values = parsed.data;

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

  const wanted: Date[] = [];
  for (const slot of values.timeSlots) {
    const at = zonedTimeToUtc(slot.date, slot.time, values.timezone);
    if (!at) return { error: "One of the times isn't a real date." };
    wanted.push(at);
  }

  const editable = {
    recipientName: values.recipientName,
    message: emptyToNull(values.message),
    imageUrl: emptyToNull(values.imageUrl),
    planPlace: emptyToNull(values.planPlace),
    planActivity: emptyToNull(values.planActivity),
    planMapUrl: emptyToNull(values.planMapUrl),
    planDressCode: emptyToNull(values.planDressCode),
    planNotes: emptyToNull(values.planNotes),
    planPhotos: values.planPhotos.map((p) => ({
      url: p.url,
      alt: p.alt || "date plan photo",
      ...(p.caption ? { caption: p.caption } : {}),
    })),
  } satisfies Partial<NewInvite>;

  const lockable = {
    question: values.question,
    timezone: values.timezone,
    allowCustomTime: values.allowCustomTime,
    themeId: values.themeId,
  } satisfies Partial<NewInvite>;

  const now = Date.now();
  const pastError = { error: "Times you add need to be in the future." };

  if (!existing) {
    if (wanted.some((at) => at.getTime() <= now)) return pastError;
    const created = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(invites)
        .values({ ...editable, ...lockable, creatorId: user.id, slug: newInviteSlug(), linkCode: newLinkCode() })
        .returning({ id: invites.id, slug: invites.slug });
      if (row && wanted.length > 0) {
        await tx.insert(inviteTimeSlots).values(wanted.map((startsAt) => ({ inviteId: row.id, startsAt })));
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
      // Keep slots that didn't change (their ids may be on a Recipient's open page);
      // only newly added times have to be in the future.
      const current = await tx
        .select({ id: inviteTimeSlots.id, startsAt: inviteTimeSlots.startsAt })
        .from(inviteTimeSlots)
        .where(eq(inviteTimeSlots.inviteId, existing.id));
      // The form edits whole minutes, so compare at minute precision.
      const minute = (d: Date) => Math.floor(d.getTime() / 60_000);
      const currentMinutes = new Set(current.map((s) => minute(s.startsAt)));
      const wantedMinutes = new Set(wanted.map(minute));

      const added = [...wantedMinutes].filter((m) => !currentMinutes.has(m)).map((m) => m * 60_000);
      if (added.some((t) => t <= now)) return pastError;
      const removed = current.filter((s) => !wantedMinutes.has(minute(s.startsAt))).map((s) => s.id);

      if (removed.length > 0) await tx.delete(inviteTimeSlots).where(inArray(inviteTimeSlots.id, removed));
      if (added.length > 0) {
        await tx.insert(inviteTimeSlots).values(added.map((t) => ({ inviteId: existing.id, startsAt: new Date(t) })));
      }
    }

    await tx
      .update(invites)
      .set({ ...editable, ...(answered ? {} : lockable), updatedAt: new Date() })
      .where(eq(invites.id, existing.id));
    return { id: existing.id };
  });
  if (result.error) return result;

  revalidatePath("/dashboard");
  revalidatePath(`/i/${existing.slug}`);
  return result;
}

/**
 * Copies one of the Creator's Invites into a brand-new one: same question,
 * Plan and Theme, but a fresh link, no Time slots (the old ones would be in
 * the past) and no Answer. The original Invite is untouched — an Answer can
 * never change, so reusing one by resetting it isn't an option; this makes a
 * new Invite instead, for sending again or to someone else.
 */
export async function duplicateInvite(inviteId: string): Promise<DuplicateResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
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
      themeId,
      recipientName: source.recipientName,
      question: source.question,
      message: source.message,
      imageUrl: source.imageUrl,
      planPlace: source.planPlace,
      planActivity: source.planActivity,
      planMapUrl: source.planMapUrl,
      planDressCode: source.planDressCode,
      planNotes: source.planNotes,
      planPhotos: source.planPhotos,
      timezone: source.timezone,
      // Old Time slots would already be in the past, so this Invite starts with
      // none; always lets them suggest a time, so it's still sendable as is.
      allowCustomTime: true,
    })
    .returning({ id: invites.id });
  if (!created) return { error: "Couldn't duplicate. Please try again." };

  revalidatePath("/dashboard");
  return { id: created.id, themeSwapped: !stillOwns };
}

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
  revalidatePath(`/i/${deleted.slug}`);
  return {};
}
