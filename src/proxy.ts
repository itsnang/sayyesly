import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy for one page. Scripts only run with this request's
 * nonce (Next.js adds it to its own scripts), so injected markup can't run
 * code (XSS). Styles allow 'unsafe-inline': the Themes are drawn with inline
 * style props, which a nonce can't cover, and CSS can't run code.
 */
function contentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // Creators paste image links from anywhere; Telegram avatars and CutLuy's QR are remote too.
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    // Uploads go straight to R2 with a signed URL.
    `connect-src 'self' https://*.r2.cloudflarestorage.com${isDev ? " ws: wss:" : ""}`,
    // The studio's live preview is our own /preview/theme.
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

// Pages behind a login. An optimistic check (cookie present, no signature or
// DB lookup) so logged-out visitors bounce to /login early; pages re-verify
// with requireUser().
const needsLogin = (path: string) => path.startsWith("/dashboard") || path.startsWith("/preview");

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (needsLogin(pathname) && !request.cookies.has(SESSION_COOKIE)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(nonce);
  // Next.js reads the nonce from the request's CSP header while rendering.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Every page; not API routes, analytics forwarding, Next.js assets, or files with an extension (images in /public).
      source: "/((?!api|ingest|_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
