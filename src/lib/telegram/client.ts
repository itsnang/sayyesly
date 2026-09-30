import "server-only";
import { requireEnv } from "@/env";
import { cache, DAY_SECONDS } from "@/lib/cache";

export type ChatId = bigint | number | string;

export type SendResult =
  | { ok: true }
  // `status` 403 means the bot is blocked by the user or was removed from the chat.
  | { ok: false; status: number; description: string };

let cachedUsername: string | null = null;

/**
 * The bot's own @username (without the @). Kept in this instance's memory and,
 * for fresh instances, in the shared cache for a day, so Telegram is rarely asked.
 */
export async function getBotUsername(): Promise<string> {
  if (cachedUsername) return cachedUsername;
  const username = await cache.remember<string>("telegram:bot-username", DAY_SECONDS, async () => {
    const token = requireEnv("TELEGRAM_BOT_TOKEN");
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, { cache: "no-store" });
    const body = (await res.json()) as { ok: boolean; result?: { username?: string } };
    return body.ok && body.result?.username ? body.result.username : null;
  });
  if (!username) throw new Error("Telegram getMe failed");
  cachedUsername = username;
  return username;
}

/** Sends a Bot API message. Never throws, even when the bot isn't configured; check `ok`. */
export async function sendMessage(
  chatId: ChatId,
  text: string,
  options: { parseMode?: "HTML"; disablePreview?: boolean } = {},
): Promise<SendResult> {
  try {
    const token = requireEnv("TELEGRAM_BOT_TOKEN");
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId.toString(),
        text,
        ...(options.parseMode ? { parse_mode: options.parseMode } : {}),
        ...(options.disablePreview ? { link_preview_options: { is_disabled: true } } : {}),
      }),
      cache: "no-store",
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { description?: string } | null;
    return { ok: false, status: res.status, description: body?.description ?? res.statusText };
  } catch (error) {
    return { ok: false, status: 0, description: error instanceof Error ? error.message : String(error) };
  }
}
