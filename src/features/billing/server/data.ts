import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ownedThemeIds } from "@/lib/db/queries";
import { themes } from "@/lib/db/schema";
import type { ThemeForSale } from "../types";

/** Available Themes with whether this Creator already owns each (free ones count as owned). */
export async function listThemesForSale(userId: string): Promise<ThemeForSale[]> {
  const [rows, owned] = await Promise.all([
    db.select().from(themes).where(eq(themes.isActive, true)).orderBy(asc(themes.sortOrder), asc(themes.name)),
    ownedThemeIds(userId),
  ]);
  return rows.map((t) => ({ id: t.id, name: t.name, priceCents: t.priceCents, owned: t.priceCents === 0 || owned.has(t.id) }));
}
