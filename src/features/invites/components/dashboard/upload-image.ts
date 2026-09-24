// Browser-only: one photo from the device to R2. Shrinks it, asks the server
// for a signed one-file upload URL, then PUTs it with progress reporting.

import { createImageUpload } from "../../actions";
import { shrinkImage } from "./shrink-image";

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export type UploadOutcome = { url: string } | { error: string };

/** PUT with upload progress (fetch can't report it). Resolves to whether R2 accepted the file. */
function putWithProgress(url: string, file: File, contentType: string, onProgress: (fraction: number) => void): Promise<boolean> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send(file);
  });
}

/** Uploads one image and returns where it will be served from. `onProgress` gets 0–1. */
export async function uploadImage(picked: File, onProgress: (fraction: number) => void = () => {}): Promise<UploadOutcome> {
  if (!ACCEPTED_IMAGE_TYPES.split(",").includes(picked.type)) return { error: "Use a JPG, PNG, WebP or GIF." };

  // Phone photos are several MB; shrinking first keeps invites quick to open on mobile data.
  const file = await shrinkImage(picked);
  const ticket = await createImageUpload({ contentType: file.type, size: file.size }).catch(() => null);
  if (!ticket?.uploadUrl || !ticket.publicUrl) return { error: ticket?.error ?? "Couldn't start the upload. Please try again." };

  const ok = await putWithProgress(ticket.uploadUrl, file, ticket.contentType ?? file.type, onProgress);
  return ok ? { url: ticket.publicUrl } : { error: "The upload didn't go through. Please try again." };
}

/** The image files among dropped or picked files. */
export function imageFiles(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}
