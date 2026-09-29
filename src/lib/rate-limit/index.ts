import "server-only";
import { env } from "@/env";
import { createRateLimiter, type RateLimitRule } from "./limiter";
import { createPostgresStore } from "./postgres-store";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** A burst window (a person spamming a bit waits it out) plus an hourly cap (a script that keeps going is shut out). */
const rule = (name: string, burst: number, perHour: number, burstMs = MINUTE): RateLimitRule => ({
  name,
  windows: [
    { limit: burst, windowMs: burstMs },
    { limit: perHour, windowMs: HOUR },
  ],
});

/**
 * Every limit in one place, keyed by Creator id unless it says otherwise. The
 * bursts are generous enough that a person never meets them in normal use;
 * the hourly caps are about ten real sessions' worth.
 */
export const RateLimit = {
  // Per IP; many phones can share one carrier address, so these stay roomy.
  AnswerByIp: rule("answer:ip", 20, 200),
  AnswerByInvite: rule("answer:invite", 30, 120),
  AnswerCheckByIp: rule("answer-check:ip", 60, 600),
  SaveInvite: rule("save", 30, 300),
  DuplicateInvite: rule("duplicate", 10, 60),
  ReopenInvite: rule("reopen", 10, 60),
  DeleteInvite: rule("delete", 20, 200),
  ShareState: rule("share-state", 60, 600),
  SongDetails: rule("song-details", 30, 300),
  Upload: rule("upload", 30, 100, 10 * MINUTE),
  BuyTheme: rule("buy", 6, 30),
  // Per Telegram chat: every command the bot answers, so spam can't use up the bot's own sending limits.
  BotCommandByChat: rule("bot-command:chat", 10, 60),
} as const satisfies Record<string, RateLimitRule>;

const limiter = createRateLimiter({
  store: createPostgresStore(),
  secret: env.SESSION_SECRET ?? "sayyesly-dev-rate-limit",
});

/** Records a hit; false when `subject` has used up `rule` for now. */
export async function allow(rule: RateLimitRule, subject: string): Promise<boolean> {
  return (await limiter.check(rule, subject)).ok;
}

/** For actions: the message to return when `subject` has used up `rule`, else undefined. */
export async function rateLimitError(rule: RateLimitRule, subject: string): Promise<string | undefined> {
  const result = await limiter.check(rule, subject);
  if (result.ok) return undefined;
  const minutes = Math.ceil(result.retryInMs / MINUTE);
  return minutes <= 1 ? "Too many tries. Please wait a minute." : `Too many tries. Please try again in ${minutes} minutes.`;
}

/**
 * Best-effort client IP behind Railway's proxy. Uses the right-most
 * X-Forwarded-For entry, the one appended by the proxy in front of us;
 * entries to its left come from the client and can be forged.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return forwarded?.at(-1) || headers.get("x-real-ip") || "unknown";
}
