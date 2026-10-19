import { currentThemeId } from "@/lib/theme-ids";
import { binder } from "./binder";
import { envelope } from "./envelope";
import { kittenNight } from "./kitten-night";
import { kittenSoft } from "./kitten-soft";
import type { ThemeDefinition } from "./types";

// Adding a Theme: build it under themes/<id>/ (component + `content`, which tells the
// editor which fields it uses), register it here and
// its link-preview renderer in og-images.ts, then add a `themes` row with the
// same id (price, availability). Nothing else changes.
const registry: Record<string, ThemeDefinition> = {
  [kittenSoft.id]: kittenSoft,
  [kittenNight.id]: kittenNight,
  [envelope.id]: envelope,
  [binder.id]: binder,
};

export const DEFAULT_THEME_ID = kittenSoft.id;

/**
 * The Theme's code, or null when the database names a Theme this build doesn't
 * have. A renamed Theme's old id (e.g. "love-letter") still finds it.
 */
export function getTheme(id: string): ThemeDefinition | null {
  return registry[currentThemeId(id)] ?? null;
}

export function hasTheme(id: string): boolean {
  return currentThemeId(id) in registry;
}

/** Every Theme this build has code for, registered or not in the database. */
export function listThemes(): ThemeDefinition[] {
  return Object.values(registry);
}

export type { InviteThemeProps, OgImageInput, OgImageRenderer, ThemeContent, ThemeDefinition } from "./types";
export { MAYBE_LATER_AFTER_DODGES, OG_IMAGE_SIZE } from "./types";
