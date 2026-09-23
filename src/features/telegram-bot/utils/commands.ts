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

export type GroupCommandMeaning = { kind: "link"; code: string } | { kind: "link-usage" } | { kind: "hint" } | null;

/**
 * What a command sent in a group asks the bot to do. The one-tap
 * `t.me/<bot>?startgroup=<Link code>` link arrives as `/start <code>`, so it
 * links the group exactly like `/link <code>`.
 */
export function interpretGroupCommand({ command, arg }: BotCommand): GroupCommandMeaning {
  const code = parseLinkCode(arg);
  switch (command) {
    case "link":
      return code ? { kind: "link", code } : { kind: "link-usage" };
    case "start":
      return code ? { kind: "link", code } : { kind: "hint" };
    case "help":
      return { kind: "hint" };
    default:
      return null;
  }
}
