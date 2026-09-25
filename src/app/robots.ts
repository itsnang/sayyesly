import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Invites are private links between two people, not landing pages.
      disallow: ["/invite/", "/i/", "/api/", "/dashboard"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
