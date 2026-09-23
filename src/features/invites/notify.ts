import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invites, users } from "@/lib/db/schema";
import { sendMessage } from "@/lib/telegram";
import { answerNotification } from "./utils/notification";

/**
 * Tells the Creator (by DM, when allowed) and every Linked group about the
 * Invite's Answer. Each chat is tried independently, so one failure never
 * blocks the others. A 403 on the DM means the Creator blocked the bot.
 */
export async function notifyAnswer(inviteId: string): Promise<void> {
  const invite = await db.query.invites.findFirst({
    where: eq(invites.id, inviteId),
    with: { creator: true, response: true, linkedGroups: true },
  });
  if (!invite?.response) return;

  const text = answerNotification({
    recipientName: invite.recipientName,
    answer: invite.response.answer,
    startsAt: invite.response.startsAt,
    timezone: invite.timezone,
    place: invite.planPlace,
    mapUrl: invite.planMapUrl,
    note: invite.response.note,
    noDodges: invite.response.noDodges,
  });

  const sends: Promise<void>[] = invite.linkedGroups.map(async (group) => {
    const sent = await sendMessage(group.chatId, text, { parseMode: "HTML", disablePreview: true });
    if (!sent.ok) console.error(`Notify group ${group.chatId} failed`, sent.status, sent.description);
  });

  if (invite.creator.canDm) {
    sends.push(
      (async () => {
        const sent = await sendMessage(invite.creator.telegramId, text, { parseMode: "HTML", disablePreview: true });
        if (sent.ok) return;
        console.error(`Notify creator ${invite.creator.id} failed`, sent.status, sent.description);
        if (sent.status === 403) {
          await db.update(users).set({ canDm: false, updatedAt: new Date() }).where(eq(users.id, invite.creator.id));
        }
      })(),
    );
  }

  await Promise.allSettled(sends);
}
