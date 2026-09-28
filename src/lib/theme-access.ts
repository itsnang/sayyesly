// Who may use which Theme. Shared by the invites slice (the studio's picker,
// saving an Invite) and the billing slice (what to sell), which can't import
// each other. Read a Creator's access with `themeAccess()` from db/queries.

export type ThemeAvailability = { id: string; isActive: boolean; priceCents: number };

/** What a Creator has: the Themes they own (a paid Purchase), and whether they're a Tester. */
export type ThemeAccess = { owned: ReadonlySet<string>; tester: boolean };

/**
 * Whether this Theme should still appear as a choice: it's on offer, or the
 * Creator already owns it. Hiding a Theme (`isActive: false`) stops it being
 * offered, but doesn't take away something already owned. Testers see the same
 * catalogue as everyone else.
 */
export function isThemeOffered(theme: ThemeAvailability, access: ThemeAccess): boolean {
  return theme.isActive || access.owned.has(theme.id);
}

/**
 * Whether a Creator may save an Invite with this Theme right now: it's on offer
 * and free (or they're a Tester), or they own it, even if it's since been hidden.
 */
export function isThemeUsable(theme: ThemeAvailability, access: ThemeAccess): boolean {
  return (theme.isActive && (theme.priceCents === 0 || access.tester)) || access.owned.has(theme.id);
}
