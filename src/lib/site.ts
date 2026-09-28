import "server-only";
import type { Metadata } from "next";
import { env } from "@/env";

/** Absolute site origin, used by metadataBase, robots.txt and the sitemap. */
export const SITE_URL = env.NEXT_PUBLIC_APP_URL;

export const SITE_TITLE = "sayyesly";

/** The landing page's headline, reused as the home page's search and link-preview title. */
export const SITE_TAGLINE = "Send an invite they'll say yes to";
export const SITE_HOME_TITLE = `${SITE_TITLE} · ${SITE_TAGLINE}`;

/** About 155 characters, so search results show it whole. */
export const SITE_DESCRIPTION =
  "Send an invite as one link: your question, the plan and a time to pick, in a Theme you choose. They answer without an account, and you hear back on Telegram.";

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

/** Where people ask for help, a refund or their data deleted: the owner on Telegram. */
export const SUPPORT_URL = "https://t.me/itsamnang";
export const SUPPORT_HANDLE = "@itsamnang";

/** When the Terms, Privacy and Refunds pages last changed (shown on them). */
export const LEGAL_UPDATED = "28 September 2026";
