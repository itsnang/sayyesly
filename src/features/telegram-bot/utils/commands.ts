export type BotCommand = { command: string; arg: string };

/** A Link code as typed in a chat, normalised; null when it can't be one. */
export function parseLinkCode(arg: string): string | null {
  const code = arg.trim().toUpperCase();
  return /^[A-Z0-9]{8}$/.test(code) ? code : null;
}

/**
 * Reads a bot command such as "/link K7PQ2XRM" from a message's text. In
 * groups Telegram may address it as "/link@botname"; commands addressed to a
 * different bot are ignored.
 */
export function parseCommand(text: string, botUsername: string): BotCommand | null {
  const match = /^\/(\w+)(?:@(\w+))?(?:\s+(.*))?$/.exec(text);
  if (!match) return null;
  const [, command, addressee, arg] = match;
  if (addressee && addressee.toLowerCase() !== botUsername.toLowerCase()) return null;
  return { command: command!, arg: arg ?? "" };
}
