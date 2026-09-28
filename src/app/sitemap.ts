import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/demo`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...["terms", "privacy", "refunds"].map((page) => ({
      url: `${SITE_URL}/${page}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
