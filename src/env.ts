import "server-only";
import { z } from "zod";

// Nothing here is required to *build*: `next build` imports server modules
// with only build-time variables present. Code that needs a secret reads it
// through `requireEnv()`, so a missing one fails loudly at the point of use
// (e.g. the first database query) instead of breaking the build.
// A blank line like `CUTLUY_API_KEY=` (as copied from .env.example) counts as unset.
const optional = (schema: z.ZodString | z.ZodURL) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: optional(z.url()),
  NEXT_PUBLIC_APP_URL: z.url(),
  SESSION_SECRET: optional(z.string().min(32)),
  TELEGRAM_CLIENT_ID: optional(z.string()),
  TELEGRAM_CLIENT_SECRET: optional(z.string()),
  TELEGRAM_BOT_TOKEN: optional(z.string()),
  TELEGRAM_WEBHOOK_SECRET: optional(z.string()),
  CUTLUY_API_KEY: optional(z.string()),
  CUTLUY_WEBHOOK_SECRET: optional(z.string()),
  R2_ACCOUNT_ID: optional(z.string()),
  R2_ACCESS_KEY_ID: optional(z.string()),
  R2_SECRET_ACCESS_KEY: optional(z.string()),
  R2_BUCKET: optional(z.string()),
  R2_PUBLIC_URL: optional(z.string().regex(/^https:\/\//, "must start with https://")),
  // Meta app id for the fb:app_id tag in link previews (developers.facebook.com → My Apps). Optional.
  FACEBOOK_APP_ID: optional(z.string().regex(/^\d+$/, "must be the numeric App ID")),
});

/**
 * The site's public origin. Set NEXT_PUBLIC_APP_URL in production (login
 * redirects and webhooks depend on it); otherwise fall back to the host's own
 * URL (Vercel preview/production, Railway), then localhost.
 */
function resolveAppUrl(): string {
  const { NEXT_PUBLIC_APP_URL, VERCEL_ENV, VERCEL_URL, VERCEL_PROJECT_PRODUCTION_URL, RAILWAY_PUBLIC_DOMAIN } =
    process.env;
  if (NEXT_PUBLIC_APP_URL) return NEXT_PUBLIC_APP_URL;
  if (VERCEL_ENV === "preview" && VERCEL_URL) return `https://${VERCEL_URL}`;
  if (VERCEL_PROJECT_PRODUCTION_URL) return `https://${VERCEL_PROJECT_PRODUCTION_URL}`;
  if (RAILWAY_PUBLIC_DOMAIN) return `https://${RAILWAY_PUBLIC_DOMAIN}`;
  return "http://localhost:3000";
}

const serverEnv = serverSchema.safeParse({ ...process.env, NEXT_PUBLIC_APP_URL: resolveAppUrl() });

if (!serverEnv.success) {
  console.error("Invalid server environment variables:", z.treeifyError(serverEnv.error));
  throw new Error("Invalid server environment variables", { cause: serverEnv.error });
}

export const env = serverEnv.data;

type OptionalKey = {
  [K in keyof typeof env]-?: undefined extends (typeof env)[K] ? K : never;
}[keyof typeof env];

export function requireEnv(key: OptionalKey): string {
  const value = env[key];
  if (!value) throw new Error(`Missing environment variable ${key}`);
  return value;
}
