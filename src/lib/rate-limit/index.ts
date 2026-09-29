import "server-only";
import { env } from "@/env";
import { createMemoryStore, createRateLimiter, type RateLimitRule } from "./limiter";

const MINUTE = 60_000;

/**
 * Every limit in one place. Generous enough that a person never meets them;
 * they stop scripts and stuck loops. Keyed by Creator id unless it says otherwise.
 */
export const RateLimit = {
  AnswerByIp: { name: "answer:ip", limit: 20, windowMs: MINUTE },
  AnswerByInvite: { name: "answer:invite", limit: 30, windowMs: MINUTE },
  AnswerCheckByIp: { name: "answer-check:ip", limit: 60, windowMs: MINUTE },
  SaveInvite: { name: "save", limit: 30, windowMs: MINUTE },
  DuplicateInvite: { name: "duplicate", limit: 10, windowMs: MINUTE },
  ReopenInvite: { name: "reopen", limit: 10, windowMs: MINUTE },
  DeleteInvite: { name: "delete", limit: 20, windowMs: MINUTE },
  ShareState: { name: "share-state", limit: 60, windowMs: MINUTE },
  SongDetails: { name: "song-details", limit: 30, windowMs: MINUTE },
  Upload: { name: "upload", limit: 30, windowMs: 10 * MINUTE },
  BuyTheme: { name: "buy", limit: 6, windowMs: MINUTE },
  LinkGroupByChat: { name: "link:chat", limit: 10, windowMs: MINUTE },
} as const satisfies Record<string, RateLimitRule>;

const limiter = createRateLimiter({
  store: createMemoryStore(),
  secret: env.SESSION_SECRET ?? "sayyesly-dev-rate-limit",
});

/** Records a hit; false when `subject` has used up `rule` for now. */
export function allow(rule: RateLimitRule, subject: string): Promise<boolean> {
  return limiter.allow(rule, subject);
}

/** For actions: the message to return when `subject` has used up `rule`, else undefined. */
export async function rateLimitError(rule: RateLimitRule, subject: string): Promise<string | undefined> {
  if (await limiter.allow(rule, subject)) return undefined;
  return rule.windowMs > MINUTE ? "Too many tries. Please wait a few minutes." : "Too many tries. Please wait a minute.";
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
