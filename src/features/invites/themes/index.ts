import { kittenSoft } from "./kitten-soft";
import type { ThemeDefinition } from "./types";

// Adding a Theme: build it under themes/<id>/, register it here, and add a
// `themes` row with the same id (price, availability). Nothing else changes.
const registry: Record<string, ThemeDefinition> = {
  [kittenSoft.id]: kittenSoft,
};

export const DEFAULT_THEME_ID = kittenSoft.id;

/** The Theme's code, or null when the database names a Theme this build doesn't have. */
export function getTheme(id: string): ThemeDefinition | null {
  return registry[id] ?? null;
}

export type { InviteThemeProps, OgImageInput, ThemeDefinition } from "./types";
export { OG_IMAGE_SIZE } from "./types";
