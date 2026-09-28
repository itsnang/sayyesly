// Anonymous product analytics (PostHog, US cloud), loaded only after the page has
// finished loading so it never delays what the visitor sees. Off unless
// NEXT_PUBLIC_POSTHOG_KEY is set. See docs: spec itsnang/sayyesly#94.
import { sanitizeEvent } from "@/lib/analytics/sanitize";
import { analyticsEnabled, attachAnalytics, onTrackedClick } from "@/lib/analytics/track";

async function startAnalytics() {
  const { default: posthog } = await import("posthog-js");
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    // Same-origin: next.config.ts forwards /ingest to PostHog's US hosts.
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    // No cookies or storage, and nobody is ever identified.
    persistence: "memory",
    person_profiles: "identified_only",
    // Page views (including client-side navigation) and our own events only.
    capture_pageview: "history_change",
    capture_pageleave: false,
    autocapture: false,
    rageclick: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_performance: false,
    capture_exceptions: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_product_tours: true,
    disable_web_experiments: true,
    advanced_disable_flags: true,
    // Never fetch extra PostHog scripts (the CSP only trusts our own).
    disable_external_dependency_loading: true,
    before_send: sanitizeEvent,
  });
  attachAnalytics(posthog);
}

if (analyticsEnabled) {
  document.addEventListener("click", onTrackedClick, { capture: true });
  const later = () => {
    const run = () => void startAnalytics().catch(() => {});
    if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 3000 });
    else setTimeout(run, 1000);
  };
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later, { once: true });
}
