import "server-only";
import { renderKittenSoftOgImage } from "./kitten-soft/og-image";
import type { OgImageRenderer } from "./types";

// Server-only: renderers read fonts and images from disk.
const renderers: Record<string, OgImageRenderer> = {
  "kitten-soft": renderKittenSoftOgImage,
};

export function getOgImageRenderer(themeId: string): OgImageRenderer | null {
  return renderers[themeId] ?? null;
}
