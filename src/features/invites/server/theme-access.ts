import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ownedThemeIds, ownsTheme } from "@/lib/db/queries";
import { themes } from "@/lib/db/schema";
import { getTheme, hasTheme, type ThemeContent } from "../themes";
import { isThemeOffered, isThemeUsable } from "./theme-availability";

export type ThemeChoice = {
  id: string;
  name: string;
  priceCents: number;
  thumbnail: string;
  /** Which fields the editor shows while this Theme is selected */
  content: ThemeContent;
  /** Free, or the Creator has a paid Purchase of it */
  usable: boolean;
};

/**
 * Themes a Creator can pick from: every Theme on offer (browsable, so a Paid
 * one they don't yet own still shows with a way to buy it), plus any Paid
 * theme they already own even after it's hidden. Hiding a Theme stops it
 * being sold; it doesn't undo owning it.
 */
export async function getThemeChoices(userId: string): Promise<ThemeChoice[]> {
  const [rows, owned] = await Promise.all([
    db.select().from(themes).orderBy(asc(themes.sortOrder), asc(themes.name)),
    ownedThemeIds(userId),
  ]);
  return rows
    .filter((t) => isThemeOffered(t, owned.has(t.id)))
    .flatMap((t) => {
      const def = getTheme(t.id);
      return def ? [{ row: t, def }] : [];
    })
    .map(({ row: t, def }) => ({
      id: t.id,
      name: t.name,
      priceCents: t.priceCents,
      thumbnail: def.thumbnail,
      content: def.content,
      usable: isThemeUsable(t, owned.has(t.id)),
    }));
}

/**
 * Server-side gate for saving an Invite with a Theme: it must exist in this
 * build and be usable, i.e. free while on offer, or owned (a paid Purchase)
 * even if it's since been hidden.
 */
export async function canUseTheme(userId: string, themeId: string): Promise<boolean> {
  if (!hasTheme(themeId)) return false;
  const theme = await db.query.themes.findFirst({ where: eq(themes.id, themeId) });
  if (!theme) return false;
  // `owned: false` here only checks the free-and-offered case; a real Purchase check follows.
  if (isThemeUsable(theme, false)) return true;
  return ownsTheme(userId, themeId);
}
