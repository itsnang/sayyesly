import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { savePendingLogin } from "@/lib/auth/oauth-state";
import { safeNextPath } from "@/lib/auth/session";
import { buildAuthorizeUrl, createPkcePair, createState, isTelegramLoginConfigured } from "@/lib/auth/telegram";

// GET /api/auth/telegram?next=/dashboard → redirects to Telegram's login page.
export async function GET(req: NextRequest) {
  if (!isTelegramLoginConfigured()) {
    console.error("Telegram login is not configured: set TELEGRAM_CLIENT_ID, TELEGRAM_CLIENT_SECRET and SESSION_SECRET");
    return NextResponse.redirect(new URL("/login?error=unavailable", env.NEXT_PUBLIC_APP_URL));
  }

  const next = safeNextPath(req.nextUrl.searchParams.get("next"));
  const state = createState();
  const { verifier, challenge } = createPkcePair();

  await savePendingLogin({ state, verifier, next });
  return NextResponse.redirect(buildAuthorizeUrl({ state, codeChallenge: challenge }));
}
