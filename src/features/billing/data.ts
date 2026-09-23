import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { purchases, themes } from "@/lib/db/schema";
import type { ThemeForSale } from "./types";

/** Available Themes with whether this Creator already owns each (free ones count as owned). */
export async function listThemesForSale(userId: string): Promise<ThemeForSale[]> {
  const [rows, paid] = await Promise.all([
    db.select().from(themes).where(eq(themes.isActive, true)).orderBy(asc(themes.sortOrder), asc(themes.name)),
    db
      .select({ themeId: purchases.themeId })
      .from(purchases)
      .where(and(eq(purchases.userId, userId), eq(purchases.status, "paid"))),
  ]);
  const owned = new Set(paid.map((p) => p.themeId));
  return rows.map((t) => ({ id: t.id, name: t.name, priceCents: t.priceCents, owned: t.priceCents === 0 || owned.has(t.id) }));
}
