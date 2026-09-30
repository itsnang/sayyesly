import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { takePendingLogin } from "@/lib/auth/oauth-state";
import { createSession, safeNextPath } from "@/lib/auth/session";
import { BOT_ACCESS_SCOPE, exchangeCode, isTelegramLoginConfigured, verifyIdToken } from "@/lib/auth/telegram";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

function redirectTo(path: string) {
  return NextResponse.redirect(new URL(path, env.NEXT_PUBLIC_APP_URL));
}

// GET /api/auth/telegram/callback?code=…&state=… → logs the Creator in.
export async function GET(req: NextRequest) {
  if (!isTelegramLoginConfigured()) return redirectTo("/login?error=unavailable");

  const params = req.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const pending = await takePendingLogin();

  if (!code || !state || !pending || pending.state !== state) {
    return redirectTo("/login?error=expired");
  }

  let identity;
  let grantedScopes;
  try {
    const exchanged = await exchangeCode({ code, codeVerifier: pending.verifier });
    grantedScopes = exchanged.grantedScopes;
    identity = await verifyIdToken(exchanged.idToken);
  } catch (error) {
    console.error("Telegram login failed", error);
    return redirectTo("/login?error=failed");
  }

  const profile = {
    telegramSub: identity.sub,
    name: identity.name,
    username: identity.username,
    photoUrl: identity.photoUrl,
    updatedAt: new Date(),
    // Logging in only ever turns can_dm on. Telegram doesn't always report bot access again on
    // later logins, and a login without it doesn't mean the bot lost access. It's turned off
    // only on real evidence: a DM refused with 403, or Telegram saying the bot was blocked.
    ...(grantedScopes?.includes(BOT_ACCESS_SCOPE) ? { canDm: true } : {}),
  };

  // Keyed on telegram_id so a Creator seeded before their first login is claimed, not duplicated.
  const [user] = await db
    .insert(users)
    .values({ telegramId: identity.telegramId, ...profile })
    .onConflictDoUpdate({ target: users.telegramId, set: profile })
    .returning({ id: users.id });

  if (!user) return redirectTo("/login?error=failed");

  await createSession(user.id);
  // Checked when the login started too; checking again here is cheap and this is the redirect that matters.
  return redirectTo(safeNextPath(pending.next));
}
