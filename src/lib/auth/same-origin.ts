/**
 * CSRF check for route handlers that change state from a form (e.g. logout),
 * the same one Next.js applies to Server Actions: the request's Origin must be
 * this host (the proxy's X-Forwarded-Host when present). Browsers always send
 * Origin on a POST; without it, only the browser's own `Sec-Fetch-Site:
 * same-origin` counts. Webhooks don't use this: they're signed instead.
 */
export function isSameOriginRequest(headers: Headers): boolean {
  const host = headers.get("x-forwarded-host")?.split(",")[0]?.trim() || headers.get("host");
  const origin = headers.get("origin");
  if (origin) {
    if (!host || origin === "null") return false;
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return headers.get("sec-fetch-site") === "same-origin";
}
