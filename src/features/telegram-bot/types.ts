import { z } from "zod";

// Only the parts of Telegram's Update object the bot reads. Unknown fields pass through.
const chatSchema = z.object({
  id: z.number(),
  type: z.enum(["private", "group", "supergroup", "channel"]),
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
