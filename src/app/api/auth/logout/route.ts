import { NextResponse } from "next/server";
import { env } from "@/env";
import { destroySession } from "@/lib/auth/session";

// POST only, so a stray link or <img> on another site can't log the Creator out.
export async function POST() {
  await destroySession();
  return NextResponse.redirect(new URL("/", env.NEXT_PUBLIC_APP_URL), 303);
}
