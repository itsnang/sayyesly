/**
 * Absolute site URL, needed by metadataBase, robots.txt and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL in production; Vercel deployments fall back to
 * their own production domain, and local dev to localhost.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_TITLE = "will you have dinner with me?";
export const SITE_DESCRIPTION =
  "one question, two buttons — and one of them runs away when you try to press it.";
