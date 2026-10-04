import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invites, users } from "@/lib/db/schema";
import { sendMessage } from "@/lib/telegram";
import { logger } from "@/lib/logger";
import { getTheme } from "../themes";
import { placeToNotify } from "../utils/invite-content";
import { answerNotification } from "../utils/notification";

/**
 * Tells the Creator (by DM) and every Linked group about the Invite's Answer.
 * Each chat is tried independently, so one failure never blocks the others.
 * A 403 on the DM means the Creator never started the bot or blocked it.
 */
export async function notifyAnswer(inviteId: string): Promise<void> {
  const invite = await db.query.invites.findFirst({
    where: eq(invites.id, inviteId),
    with: { creator: true, answer: true, linkedGroups: true },
  });
  if (!invite?.answer) return;

  // The place the Recipient saw: a Theme with several Stops showed the first one.
  const { place, mapUrl } = placeToNotify(invite, !!getTheme(invite.themeId)?.content.stops);
  const text = answerNotification({
    recipientName: invite.recipientName,
    kind: invite.answer.kind,
    startsAt: invite.answer.startsAt,
    timezone: invite.timezone,
    place,
    mapUrl,
    note: invite.answer.note,
    noDodges: invite.answer.noDodges,
  });

  const sends: Promise<void>[] = invite.linkedGroups.map(async (group) => {
    const sent = await sendMessage(group.chatId, text, { parseMode: "HTML", disablePreview: true });
    if (!sent.ok) logger.warn("notify.group_failed", { chatId: String(group.chatId), status: sent.status });
  });

  // The DM is always tried, whatever can_dm says: Telegram is the only reliable judge of
  // whether the bot may message the Creator, and a stale flag must never drop an Answer.
  // The result corrects the flag, which only decides whether the dashboard asks them to start the bot.
  const { creator } = invite;
  sends.push(
    (async () => {
      const sent = await sendMessage(creator.telegramId, text, { parseMode: "HTML", disablePreview: true });
      const canDm = sent.ok ? true : sent.status === 403 ? false : creator.canDm;
      if (!sent.ok) logger.warn("notify.creator_failed", { creatorId: creator.id, status: sent.status });
      if (canDm !== creator.canDm) {
        await db.update(users).set({ canDm, updatedAt: new Date() }).where(eq(users.id, creator.id));
      }
    })(),
  );

  await Promise.allSettled(sends);
}
