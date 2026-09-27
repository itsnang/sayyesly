import { z } from "zod";

/** A database id (uuid) arriving from a URL or a client call. */
export const idSchema = z.uuid();

/** True when `value` is a well-formed database id. */
export function isId(value: unknown): value is string {
  return idSchema.safeParse(value).success;
}

/**
 * `url` when it's an absolute http(s) link, otherwise null. For links a Creator
 * typed that end up in an `href` (a `javascript:` link would run in the
 * Recipient's page); forms already refuse them, this guards what gets rendered.
 */
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}
