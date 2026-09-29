import { z } from "zod";
import { enumValues, type EnumValue } from "@/lib/enums";

/** The kinds of Telegram chat. */
export const ChatType = { Private: "private", Group: "group", Supergroup: "supergroup", Channel: "channel" } as const;
export type ChatType = EnumValue<typeof ChatType>;

/** The bot's membership in a chat, as `my_chat_member` reports it (the ones the bot acts on). */
export const MemberStatus = { Member: "member", Left: "left", Kicked: "kicked" } as const;

// Only the parts of Telegram's Update object the bot reads. Unknown fields pass through.
const chatSchema = z.object({
  id: z.number(),
  type: z.enum(enumValues(ChatType)),
  title: z.string().optional(),
});

const userSchema = z.object({ id: z.number(), first_name: z.string().optional() });

export const updateSchema = z.object({
  update_id: z.number(),
  message: z
    .object({
      chat: chatSchema,
      from: userSchema.optional(),
      text: z.string().optional(),
      migrate_to_chat_id: z.number().optional(),
    })
    .optional(),
  my_chat_member: z
    .object({
      chat: chatSchema,
      from: userSchema,
      new_chat_member: z.object({ status: z.string(), user: userSchema }),
    })
    .optional(),
});

export type Update = z.infer<typeof updateSchema>;
export type Chat = z.infer<typeof chatSchema>;
