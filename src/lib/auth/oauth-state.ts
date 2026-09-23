import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { z } from "zod";
import { env, requireEnv } from "@/env";

// Carries the PKCE verifier, state and post-login destination from the login
// redirect to the callback, signed so it can't be tampered with in between.
const OAUTH_COOKIE = "tg_oauth";
const OAUTH_MAX_AGE_SECONDS = 10 * 60;

const pendingLoginSchema = z.object({
  state: z.string(),
  verifier: z.string(),
  next: z.string(),
});

export type PendingLogin = z.infer<typeof pendingLoginSchema>;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(requireEnv("SESSION_SECRET"));
}

export async function savePendingLogin(login: PendingLogin): Promise<void> {
  const token = await new SignJWT(login)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${OAUTH_MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  (await cookies()).set(OAUTH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/telegram",
    maxAge: OAUTH_MAX_AGE_SECONDS,
  });
}

/** Reads and clears the pending login; null when missing, expired or tampered with. */
export async function takePendingLogin(): Promise<PendingLogin | null> {
  const jar = await cookies();
  const token = jar.get(OAUTH_COOKIE)?.value;
  jar.delete({ name: OAUTH_COOKIE, path: "/api/auth/telegram" });
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return pendingLoginSchema.parse(payload);
  } catch {
    return null;
  }
}
