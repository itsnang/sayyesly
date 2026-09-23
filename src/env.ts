import "server-only";
import { z } from "zod";

// Optional vars belong to features that later phases switch on. Code that
// needs one reads it through `requireEnv()`, so a missing secret fails loudly
// at the point of use instead of blocking the whole app from starting.
// A blank line like `CUTLUY_API_KEY=` (as copied from .env.example) counts as unset.
const optional = (schema: z.ZodString) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.url(),
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
});

const serverEnv = serverSchema.safeParse(process.env);

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
