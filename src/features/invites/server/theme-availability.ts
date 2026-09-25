export type ThemeAvailability = { isActive: boolean; priceCents: number };

/**
 * Whether this Theme should still appear as a choice: it's on offer, or the
 * Creator already owns it. Hiding a Theme (`isActive: false`) stops it being
 * offered, but doesn't take away something already owned.
 */
export function isThemeOffered(theme: ThemeAvailability, owned: boolean): boolean {
  return theme.isActive || owned;
}

/**
 * Whether a Creator may save an Invite with this Theme right now: it's free
 * and currently on offer, or they own it (a paid Purchase), even if it's
 * since been hidden.
 */
export function isThemeUsable(theme: ThemeAvailability, owned: boolean): boolean {
  return (theme.isActive && theme.priceCents === 0) || owned;
}
