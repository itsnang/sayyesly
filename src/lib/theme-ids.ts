// Theme ids that were renamed, and what they're called now. Old ids can still
// arrive from shared links (/demo?theme=love-letter) and, until the rename
// migration has run, from the database. Shared by the invites and landing slices.
const RENAMED_THEME_IDS: Record<string, string> = {
  "love-letter": "envelope",
};

/** The current id for a Theme id that may be an old, renamed one. */
export function currentThemeId(id: string): string {
  return RENAMED_THEME_IDS[id] ?? id;
}

/** Every old id that now means `id`, e.g. ["love-letter"] for "envelope". */
export function formerThemeIds(id: string): string[] {
  return Object.entries(RENAMED_THEME_IDS)
    .filter(([, now]) => now === id)
    .map(([old]) => old);
}
