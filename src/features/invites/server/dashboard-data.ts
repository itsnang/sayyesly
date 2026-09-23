import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invites, inviteTimeSlots } from "@/lib/db/schema";
import { utcToZonedParts } from "@/lib/time";
import type { InviteFormValues } from "../schemas";
import { isExpired } from "../utils";

export type InviteStatus = "yes" | "maybe_later" | "expired" | "waiting";

export type InviteSummary = {
  themeId: string;
  id: string;
  slug: string;
  recipientName: string;
  question: string;
  status: InviteStatus;
  /** ISO instant of the agreed date, for a yes */
  agreedAt: string | null;
  timezone: string;
  createdAt: string;
};

/** The Creator's Invites, newest first. Only ever the given user's own. */
export async function listMyInvites(userId: string): Promise<InviteSummary[]> {
  const rows = await db.query.invites.findMany({
    where: eq(invites.creatorId, userId),
    orderBy: desc(invites.createdAt),
    with: { answer: true, timeSlots: true },
  });
  const now = new Date();
  return rows.map((row) => ({
    id: row.id,
    themeId: row.themeId,
    slug: row.slug,
    recipientName: row.recipientName,
    question: row.question.replace(/\*/g, ""),
    status: row.answer ? row.answer.kind : isExpired(row, now) ? "expired" : "waiting",
    agreedAt: row.answer?.startsAt?.toISOString() ?? null,
    timezone: row.timezone,
    createdAt: row.createdAt.toISOString(),
  }));
}

export type EditableInvite = {
  id: string;
  slug: string;
  linkCode: string;
  answered: boolean;
  values: InviteFormValues;
};

/** One of the Creator's Invites as form values, or null if it isn't theirs. */
export async function getMyInvite(inviteId: string, userId: string): Promise<EditableInvite | null> {
  const row = await db.query.invites.findFirst({
    where: and(eq(invites.id, inviteId), eq(invites.creatorId, userId)),
    with: { timeSlots: { orderBy: asc(inviteTimeSlots.startsAt) }, answer: { columns: { id: true } } },
  });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    linkCode: row.linkCode,
    answered: !!row.answer,
    values: {
      recipientName: row.recipientName,
      question: row.question,
      message: row.message ?? "",
      imageUrl: row.imageUrl ?? "",
      planPlace: row.planPlace ?? "",
      planActivity: row.planActivity ?? "",
      planMapUrl: row.planMapUrl ?? "",
      planDressCode: row.planDressCode ?? "",
      planNotes: row.planNotes ?? "",
      planPhotos: row.planPhotos.map((p) => ({ url: p.url, alt: p.alt, caption: p.caption ?? "" })),
      timezone: row.timezone,
      allowCustomTime: row.allowCustomTime,
      timeSlots: row.timeSlots.map((s) => utcToZonedParts(s.startsAt, row.timezone)),
      themeId: row.themeId,
    },
  };
}
