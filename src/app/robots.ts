import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Apps that fetch a link to draw its preview card when someone shares it.
// Meta's (Facebook, Instagram, WhatsApp) obey robots.txt: blocked, they report
// a 403 and show no preview. They may read invites; search engines may not.
const LINK_PREVIEW_BOTS = [
  "facebookexternalhit",
  "Facebot",
  "WhatsApp",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "Slackbot-LinkExpanding",
  "Discordbot",
  "TelegramBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: LINK_PREVIEW_BOTS,
        allow: "/",
        disallow: ["/api/", "/dashboard"],
      },
      {
        userAgent: "*",
        allow: "/",
        // Invites are private links between two people, not landing pages. They
        // also say noindex themselves, for crawlers that ignore this file.
        disallow: ["/invite/", "/i/", "/api/", "/dashboard"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
