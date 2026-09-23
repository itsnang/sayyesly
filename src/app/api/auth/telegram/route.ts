import { NextResponse, type NextRequest } from "next/server";
import { savePendingLogin } from "@/lib/auth/oauth-state";
import { safeNextPath } from "@/lib/auth/session";
import { buildAuthorizeUrl, createPkcePair, createState } from "@/lib/auth/telegram";

// GET /api/auth/telegram?next=/dashboard → redirects to Telegram's login page.
export async function GET(req: NextRequest) {
  const next = safeNextPath(req.nextUrl.searchParams.get("next"));
  const state = createState();
  const { verifier, challenge } = createPkcePair();

  await savePendingLogin({ state, verifier, next });
  return NextResponse.redirect(buildAuthorizeUrl({ state, codeChallenge: challenge }));
}
