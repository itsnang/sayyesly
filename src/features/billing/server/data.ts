import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { themeAccess } from "@/lib/db/queries";
import { themes } from "@/lib/db/schema";
import { isThemeUsable } from "@/lib/theme-access";
import type { ThemeForSale } from "../types";

/** Available Themes with whether this Creator already has each (free ones, owned ones, and all of them for a Tester). */
export async function listThemesForSale(userId: string): Promise<ThemeForSale[]> {
  const [rows, access] = await Promise.all([
    db.select().from(themes).where(eq(themes.isActive, true)).orderBy(asc(themes.sortOrder), asc(themes.name)),
    themeAccess(userId),
  ]);
  return rows.map((t) => ({ id: t.id, name: t.name, priceCents: t.priceCents, usable: isThemeUsable(t, access) }));
}
