import "server-only";
import type { Metadata } from "next";
import { env } from "@/env";

/** Absolute site origin, used by metadataBase, robots.txt and the sitemap. */
export const SITE_URL = env.NEXT_PUBLIC_APP_URL;

export const SITE_TITLE = "sayyesly";

/** The landing page's headline, reused as the home page's search and link-preview title. */
export const SITE_TAGLINE = "Plan a date they'll say yes to";
export const SITE_HOME_TITLE = `${SITE_TITLE} · ${SITE_TAGLINE}`;

/** About 155 characters, so search results show it whole. */
export const SITE_DESCRIPTION =
  "Ask someone out with one link: your question, the plan and a time to pick, in a Theme you choose. They answer without an account, and you hear back on Telegram.";

// Next replaces a parent's openGraph/twitter wholesale when a page sets its own,
// so pages spread these and change only what differs.
export const BASE_OPEN_GRAPH = {
  type: "website",
  siteName: SITE_TITLE,
  title: SITE_HOME_TITLE,
  description: SITE_DESCRIPTION,
  locale: "en_US",
} satisfies Metadata["openGraph"];

export const BASE_TWITTER = {
  card: "summary_large_image",
  title: SITE_HOME_TITLE,
  description: SITE_DESCRIPTION,
} satisfies Metadata["twitter"];
