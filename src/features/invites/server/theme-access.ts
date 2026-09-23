import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ownedThemeIds, ownsTheme } from "@/lib/db/queries";
import { themes } from "@/lib/db/schema";
import { getTheme, hasTheme } from "../themes";

export type ThemeChoice = {
  id: string;
  name: string;
  priceCents: number;
  thumbnail: string;
  /** Free, or the Creator has a paid Purchase of it */
  usable: boolean;
};

/** Themes a Creator can pick from, with whether they may use each one. */
export async function getThemeChoices(userId: string): Promise<ThemeChoice[]> {
  const [rows, owned] = await Promise.all([
    db.select().from(themes).where(eq(themes.isActive, true)).orderBy(asc(themes.sortOrder), asc(themes.name)),
    ownedThemeIds(userId),
  ]);
  return rows
    .filter((t) => hasTheme(t.id))
    .map((t) => ({
      id: t.id,
      name: t.name,
      priceCents: t.priceCents,
      thumbnail: getTheme(t.id)?.thumbnail ?? "",
      usable: t.priceCents === 0 || owned.has(t.id),
    }));
}

/**
 * Server-side gate for saving an Invite with a Theme: it must exist in this
 * build, be available, and be free or owned through a paid Purchase.
 */
export async function canUseTheme(userId: string, themeId: string): Promise<boolean> {
  if (!hasTheme(themeId)) return false;
  const theme = await db.query.themes.findFirst({ where: eq(themes.id, themeId) });
  if (!theme?.isActive) return false;
  return theme.priceCents === 0 || ownsTheme(userId, themeId);
}
