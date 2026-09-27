// Where to send someone after logging in: only ever a path on this site.
// Kept free of server-only imports so it can be unit-tested.

const BASE = "https://sayyesly.invalid";

/**
 * `next` if it's a plain same-site path, otherwise `fallback`. Browsers drop
 * tabs and newlines inside URLs and treat "\" like "/", so "/\t/evil.example"
 * would become "//evil.example". Anything with whitespace, control characters
 * or backslashes is refused, and the parsed result must still be on this site.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  if (/[\s\\\u0000-\u001f\u007f]/.test(next)) return fallback;
  let url: URL;
  try {
    url = new URL(next, BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== BASE) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
