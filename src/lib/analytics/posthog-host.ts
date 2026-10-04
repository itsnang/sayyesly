/**
 * The PostHog hosts, from NEXT_PUBLIC_POSTHOG_HOST (the cloud's ingestion host,
 * e.g. https://us.i.posthog.com). The asset and app hosts follow from it. Anything
 * that isn't a PostHog cloud host falls back to the US cloud: the rewrites and
 * the CSP only trust those.
 */
const DEFAULT_INGEST = "https://us.i.posthog.com";
const CLOUD = /^https:\/\/(us|eu)\.i\.posthog\.com$/;

export function posthogHosts(host: string | undefined) {
  const trimmed = host?.trim().replace(/\/+$/, "") ?? "";
  const ingest = CLOUD.test(trimmed) ? trimmed : DEFAULT_INGEST;
  const region = ingest.match(CLOUD)?.[1] ?? "us";
  return { ingest, assets: `https://${region}-assets.i.posthog.com`, app: `https://${region}.posthog.com` };
}
