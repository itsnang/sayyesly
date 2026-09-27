// Browser-only: one photo from the device to R2. Shrinks it, asks the server
// for a signed one-file upload URL, then PUTs it with progress reporting.
// Called through useImageUpload (invites/hooks), which runs it as a mutation.

import { ActionError, runAction } from "@/lib/query/action";
import { createImageUpload } from "../../actions";
import { shrinkImage } from "./shrink-image";

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

/** Thrown when the upload was cancelled (e.g. the field left the page); not something to show. */
export class UploadCancelled extends Error {
  constructor() {
    super("Upload cancelled");
    this.name = "UploadCancelled";
  }
}

/** PUT with upload progress (fetch can't report it). Rejects if R2 refuses it or `signal` aborts it. */
function putWithProgress(url: string, file: File, contentType: string, onProgress: (fraction: number) => void, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new UploadCancelled());
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new ActionError("The upload didn't go through. Please try again."));
    xhr.onerror = () => reject(new ActionError("The upload didn't go through. Check your connection and try again.", true));
    xhr.onabort = () => reject(new UploadCancelled());
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(file);
  });
}

/**
 * Uploads one image and resolves to the URL it will be served from. `onProgress`
 * gets 0–1. Throws an ActionError with a message to show, or UploadCancelled.
 */
export async function uploadImage(picked: File, { onProgress = () => {}, signal }: { onProgress?: ((fraction: number) => void) | undefined; signal?: AbortSignal | undefined } = {}): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.split(",").includes(picked.type)) throw new ActionError("Use a JPG, PNG, WebP or GIF.");

  // Phone photos are several MB; shrinking first keeps invites quick to open on mobile data.
  const file = await shrinkImage(picked);
  const ticket = await runAction(() => createImageUpload({ contentType: file.type, size: file.size }));
  if (!ticket.uploadUrl || !ticket.publicUrl) throw new ActionError("Couldn't start the upload. Please try again.");
  if (signal?.aborted) throw new UploadCancelled();

  await putWithProgress(ticket.uploadUrl, file, ticket.contentType ?? file.type, onProgress, signal);
  return ticket.publicUrl;
}

/** The image files among dropped or picked files. */
export function imageFiles(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}
