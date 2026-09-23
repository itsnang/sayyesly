import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Constant-time check of Telegram's X-Telegram-Bot-Api-Secret-Token header against our secret. */
export function isValidSecretToken(received: string | null, expected: string | undefined): boolean {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
