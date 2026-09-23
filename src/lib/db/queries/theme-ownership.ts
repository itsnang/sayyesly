import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { purchases } from "../schema";

// Shared by the invites slice (who may use a Theme) and the billing slice
// (what to sell), which can't import each other. Ownership = a paid Purchase.

/** Ids of the Themes this user has bought. */
export async function ownedThemeIds(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ themeId: purchases.themeId })
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.status, "paid")));
  return new Set(rows.map((r) => r.themeId));
}

/** Whether this user has a paid Purchase of the Theme. */
export async function ownsTheme(userId: string, themeId: string): Promise<boolean> {
  const row = await db.query.purchases.findFirst({
    where: and(eq(purchases.userId, userId), eq(purchases.themeId, themeId), eq(purchases.status, "paid")),
    columns: { id: true },
  });
  return !!row;
}
