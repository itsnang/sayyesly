import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";
import { env, requireEnv } from "@/env";

// Telegram's OpenID Connect provider: https://core.telegram.org/bots/telegram-login
const ISSUER = "https://oauth.telegram.org";
const AUTHORIZE_URL = `${ISSUER}/auth`;
const TOKEN_URL = `${ISSUER}/token`;
const jwks = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));

// `telegram:bot_access` lets the bot message the Creator right after login.
export const BOT_ACCESS_SCOPE = "telegram:bot_access";
const SCOPES = ["openid", "profile", BOT_ACCESS_SCOPE];

/** Whether every setting Telegram login needs is present (client id/secret and the session secret). */
export function isTelegramLoginConfigured(): boolean {
  return !!(env.TELEGRAM_CLIENT_ID && env.TELEGRAM_CLIENT_SECRET && env.SESSION_SECRET);
}

export function telegramRedirectUri(): string {
  return new URL("/api/auth/telegram/callback", env.NEXT_PUBLIC_APP_URL).toString();
}

function base64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function createState(): string {
  return base64url(randomBytes(24));
}

export function buildAuthorizeUrl({ state, codeChallenge }: { state: string; codeChallenge: string }): string {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", requireEnv("TELEGRAM_CLIENT_ID"));
  url.searchParams.set("redirect_uri", telegramRedirectUri());
  url.searchParams.set("scope", SCOPES.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

const tokenResponseSchema = z.object({
  id_token: z.string(),
  scope: z.string().optional(),
});

/** Exchanges an authorization code for the ID token, and reports which scopes were granted. */
export async function exchangeCode({
  code,
  codeVerifier,
}: {
  code: string;
  codeVerifier: string;
}): Promise<{ idToken: string; grantedScopes: string[] | null }> {
  const basic = Buffer.from(
    `${requireEnv("TELEGRAM_CLIENT_ID")}:${requireEnv("TELEGRAM_CLIENT_SECRET")}`,
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    // Same fields as Telegram's documented token request (client_id repeated in the body).
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: telegramRedirectUri(),
      client_id: requireEnv("TELEGRAM_CLIENT_ID"),
      code_verifier: codeVerifier,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Telegram token exchange failed: ${res.status} ${await res.text()}`);
  }

  const body = tokenResponseSchema.parse(await res.json());
  return {
    idToken: body.id_token,
    // Null when Telegram doesn't echo the scopes back; callers then keep what they knew.
    grantedScopes: body.scope ? body.scope.split(" ") : null,
  };
}

const idTokenClaimsSchema = z.object({
  sub: z.string(),
  // Numeric Telegram user ID (profile scope); also the bot's chat ID for this user.
  id: z.union([z.number().int(), z.string().regex(/^\d+$/)]),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  preferred_username: z.string().optional(),
  picture: z.string().optional(),
});

export type TelegramIdentity = {
  sub: string;
  telegramId: bigint;
  name: string;
  username: string | null;
  photoUrl: string | null;
};

/** Verifies the ID token's signature, issuer, audience and expiry, then returns the Creator's identity. */
export async function verifyIdToken(idToken: string): Promise<TelegramIdentity> {
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: ISSUER,
    audience: requireEnv("TELEGRAM_CLIENT_ID"),
  });

  const claims = idTokenClaimsSchema.parse(payload);
  const name =
    claims.name ??
    ([claims.given_name, claims.family_name].filter(Boolean).join(" ") ||
      claims.preferred_username ||
      "Telegram user");

  return {
    sub: claims.sub,
    telegramId: BigInt(claims.id),
    name,
    username: claims.preferred_username ?? null,
    photoUrl: claims.picture ?? null,
  };
}
