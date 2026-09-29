import "server-only";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/lib/db";
import { invites, linkedGroups, users } from "@/lib/db/schema";
import { allow, RateLimit } from "@/lib/rate-limit";
import { escapeHtml, getBotUsername, sendMessage } from "@/lib/telegram";
import { ChatType, MemberStatus, type Chat, type Update } from "../types";
import { Command, GroupAction, interpretGroupCommand, parseCommand } from "../utils/commands";

const isGroup = (chat: Chat) => chat.type === ChatType.Group || chat.type === ChatType.Supergroup;

function reply(chat: Chat, text: string) {
  return sendMessage(chat.id, text, { parseMode: "HTML", disablePreview: true });
}

function helpText(): string {
  const dashboard = new URL("/dashboard", env.NEXT_PUBLIC_APP_URL).toString();
  return [
    "💌 <b>Hi! I'm the sayyesly bot.</b>",
    "",
    `Make an invite at ${dashboard}. When someone answers it, I'll message you right here.`,
    "",
    "Want a group to hear the news too? Tap <b>Add the bot to a group chat</b> on your invite in the dashboard, " +
      "or add me to the group and send <code>/link CODE</code> there.",
  ].join("\n");
}

/** Handles one verified Telegram update. Never throws for bad input; logs and moves on. */
export async function handleUpdate(update: Update): Promise<void> {
  if (update.message) await handleMessage(update.message);
  if (update.my_chat_member) await handleMembership(update.my_chat_member);
}

async function handleMessage(message: NonNullable<Update["message"]>) {
  const { chat } = message;

  // A group upgraded to a supergroup gets a new chat id; keep its links working.
  if (message.migrate_to_chat_id) {
    await db
      .update(linkedGroups)
      .set({ chatId: BigInt(message.migrate_to_chat_id) })
      .where(eq(linkedGroups.chatId, BigInt(chat.id)));
    return;
  }

  if (!message.text) return;
  const parsed = parseCommand(message.text, await getBotUsername());
  if (!parsed) return;

  if (isGroup(chat)) {
    const meaning = interpretGroupCommand(parsed);
    if (meaning?.kind === GroupAction.Link) await linkGroup(chat, meaning.code);
    else if (meaning?.kind === GroupAction.LinkUsage)
      await reply(chat, "Send it like this: <code>/link K7PQ2XRM</code>. The code is on your invite in the dashboard.");
    else if (meaning?.kind === GroupAction.Hint) await reply(chat, "Send <code>/link CODE</code> here to get invite news in this group 💌");
    return;
  }

  switch (parsed.command) {
    case Command.Start:
    case Command.Help: {
      if (chat.type === ChatType.Private && message.from) {
        // Talking to the bot means it may message this Creator again.
        await db
          .update(users)
          .set({ canDm: true, updatedAt: new Date() })
          .where(eq(users.telegramId, BigInt(message.from.id)));
      }
      await reply(chat, helpText());
      return;
    }
    case Command.Link: {
      await reply(chat, "Add me to a group first, then send <code>/link CODE</code> in that group.");
      return;
    }
  }
}

/**
 * Links a group to the Invite with this Link code. Works from the command
 * alone (chat id and title are on the message), whatever order Telegram
 * delivers the membership update in, and is harmless to repeat.
 */
async function linkGroup(chat: Chat, code: string) {
  // Stops a group guessing Link codes: past the limit the bot stays quiet until the minute is up.
  if (!(await allow(RateLimit.LinkGroupByChat, String(chat.id)))) return;
  const invite = await db.query.invites.findFirst({
    where: eq(invites.linkCode, code),
    columns: { id: true, recipientName: true },
  });
  if (!invite) {
    await reply(chat, "I couldn't find an invite with that code. Double-check it in your dashboard?");
    return;
  }

  await db
    .insert(linkedGroups)
    .values({ inviteId: invite.id, chatId: BigInt(chat.id), chatTitle: chat.title ?? null })
    .onConflictDoNothing({ target: [linkedGroups.inviteId, linkedGroups.chatId] });

  const who = invite.recipientName.trim() ? `${escapeHtml(invite.recipientName)} answers` : "they answer";
  await reply(chat, `Linked ✓ This group will hear the moment ${who} 💌`);
}

async function handleMembership(change: NonNullable<Update["my_chat_member"]>) {
  const { chat, new_chat_member: member } = change;
  const gone = member.status === MemberStatus.Left || member.status === MemberStatus.Kicked;

  if (isGroup(chat) && gone) {
    await db.delete(linkedGroups).where(eq(linkedGroups.chatId, BigInt(chat.id)));
    return;
  }

  if (chat.type === ChatType.Private) {
    // "kicked" in a private chat means the user blocked the bot; "member" means they (re)started it.
    await db
      .update(users)
      .set({ canDm: !gone, updatedAt: new Date() })
      .where(eq(users.telegramId, BigInt(chat.id)));
  }
}
