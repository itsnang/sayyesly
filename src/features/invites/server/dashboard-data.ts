import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invites, inviteTimeSlots, linkedGroups } from "@/lib/db/schema";
import type { AnswerKind } from "@/lib/enums";
import { utcToZonedParts } from "@/lib/time";
import { InviteStatus } from "../enums";
import type { InviteFormValues } from "../schemas";
import { isExpired } from "../utils";

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
    status: row.answer ? row.answer.kind : isExpired(row, now) ? InviteStatus.Expired : InviteStatus.Waiting,
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
  /** Which Answer it has, if any */
  answerKind: AnswerKind | null;
  /** ISO instant of the time they agreed to, for a Yes */
  answerAt: string | null;
  /** Every Time slot has passed and no Custom time is allowed: without an Answer, it couldn't be answered */
  expired: boolean;
  /** Group chats that hear the Answer, newest last */
  linkedGroups: { id: string; title: string | null }[];
  values: InviteFormValues;
};

/** One of the Creator's Invites as form values, or null if it isn't theirs. */
export async function getMyInvite(inviteId: string, userId: string): Promise<EditableInvite | null> {
  const row = await db.query.invites.findFirst({
    where: and(eq(invites.id, inviteId), eq(invites.creatorId, userId)),
    with: {
      timeSlots: { orderBy: asc(inviteTimeSlots.startsAt) },
      answer: { columns: { kind: true, startsAt: true } },
      linkedGroups: { columns: { id: true, chatTitle: true }, orderBy: asc(linkedGroups.createdAt) },
    },
  });
  if (!row) return null;
  const now = Date.now();
  const hasFutureSlot = row.timeSlots.some((s) => s.startsAt.getTime() > now);
  return {
    id: row.id,
    slug: row.slug,
    linkCode: row.linkCode,
    answered: !!row.answer,
    answerKind: row.answer?.kind ?? null,
    answerAt: row.answer?.startsAt?.toISOString() ?? null,
    expired: isExpired(row, new Date(now)),
    linkedGroups: row.linkedGroups.map((g) => ({ id: g.id, title: g.chatTitle })),
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
      songUrl: row.songUrl ?? "",
      songStart: row.songStart,
      songLength: row.songLength,
      timezone: row.timezone,
      // Older Invites could offer times and a calendar at once; they open as
      // "I'll pick the times" (and keep both for Recipients until saved again).
      // Only upcoming times count: if they've all passed, the calendar is what
      // keeps the Invite answerable, so it opens as "Let them pick".
      allowCustomTime: row.allowCustomTime && !hasFutureSlot,
      timeOfDay: row.timeOfDay,
      timeSlots: row.timeSlots.map((s) => utcToZonedParts(s.startsAt, row.timezone)),
      themeId: row.themeId,
    },
  };
}
