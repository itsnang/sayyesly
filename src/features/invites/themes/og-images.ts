import "server-only";
import { currentThemeId } from "@/lib/theme-ids";
import { renderEnvelopeOgImage } from "./envelope/og-image";
import { renderKittenSoftOgImage } from "./kitten-soft/og-image";
import type { OgImageRenderer } from "./types";

// Server-only: renderers read fonts and images from disk.
const renderers: Record<string, OgImageRenderer> = {
  "kitten-soft": renderKittenSoftOgImage,
  // The night theme shares the daytime preview until it gets its own.
  "kitten-night": renderKittenSoftOgImage,
  envelope: renderEnvelopeOgImage,
};

export function getOgImageRenderer(themeId: string): OgImageRenderer | null {
  return renderers[currentThemeId(themeId)] ?? null;
}
