import { z } from "zod";
import { isValidTimeZone } from "@/lib/time";
import { TIMES_OF_DAY } from "@/lib/time/time-of-day";
import { recognizeSong } from "../utils/song";

// Form values are plain strings/booleans (empty string = not set) so the same
// schema drives React Hook Form in the browser and validation on the server.
const optionalText = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters`);

const imageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https:\/\//.test(v) || /^\/[\w./-]+$/.test(v), "Use an https:// image link");

const linkUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Use a full link starting with https://");

// A YouTube or Spotify link to one song; the refusal says what to paste instead.
const songUrl = z
  .string()
  .trim()
  .max(2000)
  .superRefine((v, ctx) => {
    if (v === "") return;
    const song = recognizeSong(v);
    if (!song.ok) ctx.addIssue({ code: "custom", message: song.reason });
  });

export const MAX_TIME_SLOTS = 8;
export const MAX_PLAN_PHOTOS = 3;

export const inviteFormSchema = z
  .object({
    // Optional: only the Creator sees it (dashboard, Telegram). Empty means "no name".
    recipientName: optionalText(60),
    question: z
      .string()
      .trim()
      .min(1, "Ask your question")
      .max(140, "Keep it under 140 characters")
      .refine((q) => q.replace(/\*/g, "").trim().length > 0, "Ask your question"),
    message: optionalText(500),
    imageUrl,
    planPlace: optionalText(80),
    planActivity: optionalText(60),
    planMapUrl: linkUrl,
    planDressCode: optionalText(80),
    planNotes: optionalText(500),
    planPhotos: z
      .array(
        z.object({
          url: imageUrl.refine((v) => v !== "", "Add the photo or remove this row"),
          alt: optionalText(120),
          caption: optionalText(40),
        }),
      )
      .max(MAX_PLAN_PHOTOS),
    songUrl,
    timezone: z.string().refine(isValidTimeZone, "Pick a real time zone, e.g. Asia/Phnom_Penh"),
    // The When section's mode: true is "Let them pick" (a calendar, no Time slots),
    // false is "I'll pick the times" (only the Time slots below).
    allowCustomTime: z.boolean(),
    // A form from before this field existed (a tab left open across a deploy) still saves, as Evening.
    timeOfDay: z.enum(TIMES_OF_DAY).catch("evening"),
    timeSlots: z
      .array(
        z.object({
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
          time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
        }),
      )
      .max(MAX_TIME_SLOTS, `Offer at most ${MAX_TIME_SLOTS} times`),
    themeId: z.string().min(1, "Pick a theme"),
  })
  .refine((v) => v.timeSlots.length > 0 || v.allowCustomTime, {
    message: "Add at least one time, or choose Let them pick",
    path: ["timeSlots"],
  });

export type InviteFormValues = z.infer<typeof inviteFormSchema>;
