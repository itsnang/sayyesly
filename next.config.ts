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
  async redirects() {
    return [
      // The old single-page site's date picker; its links were already shared.
      { source: "/picker", destination: "/i/k1tten-d1n", permanent: true },
    ];
  },
};

export default nextConfig;
