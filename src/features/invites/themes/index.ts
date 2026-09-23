import { kittenSoft } from "./kitten-soft";
import type { ThemeDefinition } from "./types";

// Adding a Theme: build it under themes/<id>/, register its component here and
// its link-preview renderer in og-images.ts, then add a `themes` row with the
// same id (price, availability). Nothing else changes.
const registry: Record<string, ThemeDefinition> = {
  [kittenSoft.id]: kittenSoft,
};

export const DEFAULT_THEME_ID = kittenSoft.id;

/** The Theme's code, or null when the database names a Theme this build doesn't have. */
export function getTheme(id: string): ThemeDefinition | null {
  return registry[id] ?? null;
}

export function hasTheme(id: string): boolean {
  return id in registry;
}

export type { InviteThemeProps, OgImageInput, OgImageRenderer, ThemeDefinition } from "./types";
export { MAYBE_LATER_AFTER_DODGES, OG_IMAGE_SIZE } from "./types";
