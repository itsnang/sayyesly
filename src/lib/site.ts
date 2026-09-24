import "server-only";
import { env } from "@/env";

/** Absolute site origin, used by metadataBase, robots.txt and the sitemap. */
export const SITE_URL = env.NEXT_PUBLIC_APP_URL;

export const SITE_TITLE = "sayyesly";
export const SITE_DESCRIPTION =
  "one question, two buttons, and one of them runs away when you try to press it.";
