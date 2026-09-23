import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The old single-page site's date picker; its links were already shared.
      { source: "/picker", destination: "/i/k1tten-d1n", permanent: true },
    ];
  },
};

export default nextConfig;
