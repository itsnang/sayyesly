import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let the dev server be reached through a Cloudflare quick tunnel
  // (`cloudflared tunnel --url http://localhost:3000`), which Telegram login
  // needs because it only redirects to registered https URLs. Dev only.
  allowedDevOrigins: ["*.trycloudflare.com"],
  async redirects() {
    return [
      // The old single-page site's date picker; its links were already shared.
      { source: "/picker", destination: "/i/k1tten-d1n", permanent: true },
    ];
  },
};

export default nextConfig;
