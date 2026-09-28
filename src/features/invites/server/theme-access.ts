import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { themeAccess } from "@/lib/db/queries";
import { themes } from "@/lib/db/schema";
import { isThemeOffered, isThemeUsable } from "@/lib/theme-access";
import { getTheme, hasTheme, type ThemeContent } from "../themes";

export type ThemeChoice = {
  id: string;
  name: string;
  priceCents: number;
  thumbnail: string;
  /** Which fields the editor shows while this Theme is selected */
  content: ThemeContent;
  /** Free, the Creator has a paid Purchase of it, or they're a Tester */
  usable: boolean;
};

/**
 * Themes a Creator can pick from: every Theme on offer (browsable, so a Paid
 * one they don't yet own still shows with a way to buy it), plus any Paid
 * theme they already own even after it's hidden. Hiding a Theme stops it
 * being sold; it doesn't undo owning it.
 */
export async function getThemeChoices(userId: string): Promise<ThemeChoice[]> {
  const [rows, access] = await Promise.all([
    db.select().from(themes).orderBy(asc(themes.sortOrder), asc(themes.name)),
    themeAccess(userId),
  ]);
  return rows
    .filter((t) => isThemeOffered(t, access))
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
      usable: isThemeUsable(t, access),
    }));
}

/**
 * Server-side gate for saving an Invite with a Theme: it must exist in this
 * build and be usable, i.e. free while on offer (or any price for a Tester),
 * or owned (a paid Purchase) even if it's since been hidden.
 */
export async function canUseTheme(userId: string, themeId: string): Promise<boolean> {
  if (!hasTheme(themeId)) return false;
  const [theme, access] = await Promise.all([
    db.query.themes.findFirst({ where: eq(themes.id, themeId) }),
    themeAccess(userId),
  ]);
  return !!theme && isThemeUsable(theme, access);
}
