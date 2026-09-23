import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { purchases, themes } from "@/lib/db/schema";
import { hasTheme } from "./themes";

export type ThemeChoice = {
  id: string;
  name: string;
  priceCents: number;
  /** Free, or the Creator has a paid Purchase of it */
  usable: boolean;
};

async function ownedThemeIds(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ themeId: purchases.themeId })
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.status, "paid")));
  return new Set(rows.map((r) => r.themeId));
}

/** Themes a Creator can pick from, with whether they may use each one. */
export async function getThemeChoices(userId: string): Promise<ThemeChoice[]> {
  const [rows, owned] = await Promise.all([
    db.select().from(themes).where(eq(themes.isActive, true)).orderBy(asc(themes.sortOrder), asc(themes.name)),
    ownedThemeIds(userId),
  ]);
  return rows
    .filter((t) => hasTheme(t.id))
    .map((t) => ({ id: t.id, name: t.name, priceCents: t.priceCents, usable: t.priceCents === 0 || owned.has(t.id) }));
}

/**
 * Server-side gate for saving an Invite with a Theme: it must exist in this
 * build, be available, and be free or owned through a paid Purchase.
 */
export async function canUseTheme(userId: string, themeId: string): Promise<boolean> {
  if (!hasTheme(themeId)) return false;
  const theme = await db.query.themes.findFirst({ where: eq(themes.id, themeId) });
  if (!theme?.isActive) return false;
  if (theme.priceCents === 0) return true;
  const paid = await db.query.purchases.findFirst({
    where: and(eq(purchases.userId, userId), eq(purchases.themeId, themeId), eq(purchases.status, "paid")),
    columns: { id: true },
  });
  return !!paid;
}
