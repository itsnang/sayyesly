import "server-only";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/lib/db";
import { invites, linkedGroups, users } from "@/lib/db/schema";
import { escapeHtml, getBotUsername, sendMessage } from "@/lib/telegram";
import type { Chat, Update } from "../types";
import { interpretGroupCommand, parseCommand } from "../utils/commands";

const isGroup = (chat: Chat) => chat.type === "group" || chat.type === "supergroup";

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
    if (meaning?.kind === "link") await linkGroup(chat, meaning.code);
    else if (meaning?.kind === "link-usage")
      await reply(chat, "Send it like this: <code>/link K7PQ2XRM</code>. The code is on your invite in the dashboard.");
    else if (meaning?.kind === "hint") await reply(chat, "Send <code>/link CODE</code> here to get invite news in this group 💌");
    return;
  }

  switch (parsed.command) {
    case "start":
    case "help": {
      if (chat.type === "private" && message.from) {
        // Talking to the bot means it may message this Creator again.
        await db
          .update(users)
          .set({ canDm: true, updatedAt: new Date() })
          .where(eq(users.telegramId, BigInt(message.from.id)));
      }
      await reply(chat, helpText());
      return;
    }
    case "link": {
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
  const gone = member.status === "left" || member.status === "kicked";

  if (isGroup(chat) && gone) {
    await db.delete(linkedGroups).where(eq(linkedGroups.chatId, BigInt(chat.id)));
    return;
  }

  if (chat.type === "private") {
    // "kicked" in a private chat means the user blocked the bot; "member" means they (re)started it.
    await db
      .update(users)
      .set({ canDm: !gone, updatedAt: new Date() })
      .where(eq(users.telegramId, BigInt(chat.id)));
  }
}
