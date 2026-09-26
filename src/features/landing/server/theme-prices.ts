import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { themes } from "@/lib/db/schema";

/** The Themes the landing page shows. */
export const LANDING_THEME_IDS = ["kitten-soft", "love-letter"] as const;
export type LandingThemeId = (typeof LANDING_THEME_IDS)[number];

/**
 * Current price of each landing Theme that's on sale, in cents (0 is free).
 * A Theme that's hidden or not published yet is simply missing, so the page
 * never advertises something nobody can buy.
 */
export async function landingThemePrices(): Promise<Partial<Record<LandingThemeId, number>>> {
  const rows = await db
    .select({ id: themes.id, priceCents: themes.priceCents })
    .from(themes)
    .where(and(eq(themes.isActive, true), inArray(themes.id, [...LANDING_THEME_IDS])));
  return Object.fromEntries(rows.map((r) => [r.id, r.priceCents]));
}
