import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { takePendingLogin } from "@/lib/auth/oauth-state";
import { createSession } from "@/lib/auth/session";
import { BOT_ACCESS_SCOPE, exchangeCode, verifyIdToken } from "@/lib/auth/telegram";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

function redirectTo(path: string) {
  return NextResponse.redirect(new URL(path, env.NEXT_PUBLIC_APP_URL));
}

// GET /api/auth/telegram/callback?code=…&state=… → logs the Creator in.
export async function GET(req: NextRequest) {
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
    // Only change can_dm when Telegram tells us which scopes were granted.
    ...(grantedScopes ? { canDm: grantedScopes.includes(BOT_ACCESS_SCOPE) } : {}),
  };

  // Keyed on telegram_id so a Creator seeded before their first login is claimed, not duplicated.
  const [user] = await db
    .insert(users)
    .values({ telegramId: identity.telegramId, ...profile })
    .onConflictDoUpdate({ target: users.telegramId, set: profile })
    .returning({ id: users.id });

  if (!user) return redirectTo("/login?error=failed");

  await createSession(user.id);
  return redirectTo(pending.next);
}
