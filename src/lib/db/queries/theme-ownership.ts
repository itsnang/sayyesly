import "server-only";
import { and, eq } from "drizzle-orm";
import type { ThemeAccess } from "@/lib/theme-access";
import { db } from "../client";
import { purchases, users } from "../schema";

// Shared by the invites slice (who may use a Theme) and the billing slice
// (what to sell), which can't import each other. Ownership = a paid Purchase;
// a Tester can also use every Theme on offer (see lib/theme-access).

/** The Themes this Creator owns, and whether they're a Tester. */
export async function themeAccess(userId: string): Promise<ThemeAccess> {
  const [rows, user] = await Promise.all([
    db
      .select({ themeId: purchases.themeId })
      .from(purchases)
      .where(and(eq(purchases.userId, userId), eq(purchases.status, "paid"))),
    db.query.users.findFirst({ where: eq(users.id, userId), columns: { testerSince: true } }),
  ]);
  return { owned: new Set(rows.map((r) => r.themeId)), tester: !!user?.testerSince };
}
