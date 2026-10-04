import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";

// R2_PUBLIC_URL (docs/r2-setup.md) is where Creator-uploaded photos are served
// from; everything else pasted as an image link stays unoptimized (see
// isOptimizable in themes/kitten-soft/shared.tsx) rather than opening the
// image optimizer to arbitrary hosts.
const r2Host = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null;

const nextConfig: NextConfig = {
  // Let the dev server be reached through a Cloudflare quick tunnel
  // (`cloudflared tunnel --url http://localhost:3000`), which Telegram login
  // needs because it only redirects to registered https URLs. Dev only.
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    remotePatterns: r2Host ? [{ protocol: "https", hostname: r2Host, pathname: "/**" }] : [],
  },
  // Inlined into the client bundle so themes can tell an R2-hosted photo
  // (optimizable) from any other pasted link (isn't); not secret, same value
  // as the server-only R2_PUBLIC_URL in src/env.ts.
  env: {
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
  },
  // Sent with every response, pages and files alike. The Content-Security-Policy
  // needs a fresh nonce per page, so it's set in proxy.ts instead.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Only our own pages may frame us (the studio frames /preview/theme): no clickjacking.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // The old single-page site's date picker; its links were already shared.
      { source: "/picker", destination: "/i/k1tten-d1n", permanent: true },
    ];
  },
  // Analytics goes to our own origin and is forwarded to PostHog's US hosts (the project is on us.posthog.com),
  // so the CSP stays same-origin and ad blockers don't drop it
  // (src/instrumentation-client.ts).
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  // PostHog's API paths end in a slash; don't redirect them away from it.
  skipTrailingSlashRedirect: true,
};

// Readable stacks in PostHog's error tracking (docs/adr/0005): the build uploads its
// source maps. Only when the build has a PostHog personal API key and project id
// (Vercel build env vars), so local builds and CI are unaffected.
const { POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID } = process.env;

export default POSTHOG_PERSONAL_API_KEY && POSTHOG_PROJECT_ID
  ? withPostHogConfig(nextConfig, {
      personalApiKey: POSTHOG_PERSONAL_API_KEY,
      projectId: POSTHOG_PROJECT_ID,
      host: "https://us.posthog.com",
      sourcemaps: { enabled: true, deleteAfterUpload: true },
    })
  : nextConfig;
