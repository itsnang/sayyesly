import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The picker is a step inside the flow, not a landing page.
      disallow: "/picker",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
