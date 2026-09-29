import type { EnumValue } from "@/lib/enums";

/** The commands the bot understands. */
export const Command = { Start: "start", Help: "help", Link: "link" } as const;

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

/** What the bot does with a command sent in a group. */
export const GroupAction = { Link: "link", LinkUsage: "link-usage", Hint: "hint" } as const;
export type GroupAction = EnumValue<typeof GroupAction>;

export type GroupCommandMeaning =
  | { kind: typeof GroupAction.Link; code: string }
  | { kind: typeof GroupAction.LinkUsage }
  | { kind: typeof GroupAction.Hint }
  | null;

/**
 * What a command sent in a group asks the bot to do. The one-tap
 * `t.me/<bot>?startgroup=<Link code>` link arrives as `/start <code>`, so it
 * links the group exactly like `/link <code>`.
 */
export function interpretGroupCommand({ command, arg }: BotCommand): GroupCommandMeaning {
  const code = parseLinkCode(arg);
  switch (command) {
    case Command.Link:
      return code ? { kind: GroupAction.Link, code } : { kind: GroupAction.LinkUsage };
    case Command.Start:
      return code ? { kind: GroupAction.Link, code } : { kind: GroupAction.Hint };
    case Command.Help:
      return { kind: GroupAction.Hint };
    default:
      return null;
  }
}
