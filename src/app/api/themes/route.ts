import { NextResponse } from "next/server";
import { listThemes } from "@/features/invites/themes";
import { SITE_URL } from "@/lib/site";

/**
 * GET /api/themes → every Theme this build has code for (id, name, thumbnail),
 * including ones with no `themes` row yet. Public and read-only: no login, and
 * nothing beyond what a link-preview picker needs. Short-cached so a newly
 * deployed Theme shows up soon after.
 */
export async function GET() {
  const body = listThemes().map((theme) => ({
    id: theme.id,
    name: theme.name,
    thumbnail: `${SITE_URL}${theme.thumbnail}`,
  }));
  return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
