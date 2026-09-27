import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { isSameOriginRequest } from "@/lib/auth/same-origin";
import { destroySession } from "@/lib/auth/session";

// POST only, so a stray link or <img> on another site can't log the Creator out,
// and only from our own pages (CSRF), same as Next.js checks for Server Actions.
export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req.headers)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await destroySession();
  return NextResponse.redirect(new URL("/", env.NEXT_PUBLIC_APP_URL), 303);
}
