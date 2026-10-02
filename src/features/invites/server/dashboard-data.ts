import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invites, inviteTimeSlots, linkedGroups } from "@/lib/db/schema";
import type { AnswerKind } from "@/lib/enums";
import type { InviteStatus } from "../enums";
import type { InviteFormValues } from "../schemas";
import { inviteState, savedToForm } from "../utils/invite-content";

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
    status: inviteState(row, now).status,
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
  const now = new Date();
  return {
    id: row.id,
    slug: row.slug,
    linkCode: row.linkCode,
    answered: !!row.answer,
    answerKind: row.answer?.kind ?? null,
    answerAt: row.answer?.startsAt?.toISOString() ?? null,
    expired: inviteState(row, now).outOfTimes,
    linkedGroups: row.linkedGroups.map((g) => ({ id: g.id, title: g.chatTitle })),
    values: savedToForm(row, now),
  };
}
