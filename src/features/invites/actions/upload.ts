"use server";

import { nanoid } from "nanoid";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { isUploadConfigured, presignUpload } from "@/lib/storage/r2";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const uploadRequestSchema = z.object({
  contentType: z.enum(Object.keys(EXTENSIONS) as [string, ...string[]]),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

type UploadResult = { error?: string; uploadUrl?: string; publicUrl?: string; contentType?: string };

/** Hands the logged-in Creator a one-file upload URL for an invite image. */
export async function createImageUpload(input: { contentType: string; size: number }): Promise<UploadResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (!isUploadConfigured()) return { error: "Uploads aren't set up yet. Paste an image link instead." };

  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) return { error: "Use a JPG, PNG, WebP or GIF under 5 MB." };

  const key = `invites/${user.id}/${nanoid(16)}.${EXTENSIONS[parsed.data.contentType]}`;
  const { uploadUrl, publicUrl } = await presignUpload(key, parsed.data.contentType);
  return { uploadUrl, publicUrl, contentType: parsed.data.contentType };
}

/** Whether the upload button should be shown at all. */
export async function uploadsEnabled(): Promise<boolean> {
  return isUploadConfigured();
}
