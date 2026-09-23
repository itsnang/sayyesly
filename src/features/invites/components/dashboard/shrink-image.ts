// Browser-only: shrinks a photo before it's uploaded, so invites load fast on
// phones and the bucket stays small. A 4 MB phone photo becomes ~300 KB.

const MAX_SIDE = 1600;
const QUALITY = 0.85;
/** Files already this small and within MAX_SIDE are uploaded as they are. */
const SMALL_ENOUGH = 400 * 1024;

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/**
 * Longest side at most 1600px, re-encoded as WebP (or JPEG where the browser
 * can't encode WebP). Returns the original file when shrinking can't help:
 * GIFs (to keep animations), images the browser can't decode, transparent
 * PNGs without WebP support, or when the result wouldn't be smaller.
 */
export async function shrinkImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= SMALL_ENOUGH) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Browsers that can't encode WebP hand back a PNG instead; fall back to JPEG,
  // except for PNGs, whose transparency JPEG would lose.
  let blob = await toBlob(canvas, "image/webp");
  if (blob?.type !== "image/webp") {
    if (file.type === "image/png") return file;
    blob = await toBlob(canvas, "image/jpeg");
  }
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.${ext}`, { type: blob.type });
}
