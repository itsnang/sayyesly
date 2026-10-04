import type { PostHog } from "posthog-js";
import type { AnalyticsEvent, AnalyticsEvents, PropsArg } from "./events";

// Off unless a PostHog project key is configured (public, inlined at build).
export const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

// PostHog loads after the page has, so events before that wait here.
let client: PostHog | null = null;
const waiting: [string, object][] = [];
const MAX_WAITING = 50;
const waitingErrors: [unknown, object][] = [];

// Our events are few and often come right before a page change (a login
// redirect), so they skip PostHog's batching; clicks go by beacon, which
// survives the page unloading.
function send(event: string, props: object, beacon = false): void {
  if (!analyticsEnabled || typeof window === "undefined") return;
  if (!client) {
    if (waiting.length < MAX_WAITING) waiting.push([event, props]);
    return;
  }
  client.capture(event, props, { send_instantly: true, ...(beacon ? { transport: "sendBeacon" as const } : {}) });
}

/** Records an analytics event. Does nothing when analytics is off. */
export function track<E extends AnalyticsEvent>(event: E, ...[props]: PropsArg<E>): void {
  send(event, props ?? {});
}

/** Called once PostHog is ready: sends what was waiting. */
export function attachAnalytics(posthog: PostHog): void {
  client = posthog;
  for (const [event, props] of waiting.splice(0)) send(event, props);
  for (const [error, props] of waitingErrors.splice(0)) posthog.captureException(error, props);
}

/**
 * Reports an error the browser caught for us (an error boundary). Unhandled
 * errors are caught by PostHog itself; this is for the ones React swallows.
 * The message is dropped before sending (sanitize.ts), the digest links it to the server's report.
 */
export function reportError(error: unknown, props: { digest?: string | undefined } = {}): void {
  if (!analyticsEnabled || typeof window === "undefined") return;
  const extra = { ...(props.digest ? { digest: props.digest } : {}) };
  if (client) client.captureException(error, extra);
  else if (waitingErrors.length < MAX_WAITING) waitingErrors.push([error, extra]);
}

/**
 * Attributes that record an event when the element is clicked, for links in
 * server components. The click listener set up with PostHog reads them.
 */
export function trackClick<E extends AnalyticsEvent>(event: E, ...[props]: PropsArg<E>) {
  return { "data-track": event, ...(props ? { "data-track-props": JSON.stringify(props) } : {}) };
}

/** The listener behind trackClick. */
export function onTrackedClick(e: MouseEvent): void {
  const el = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-track]") : null;
  if (!el?.dataset.track) return;
  let props: object = {};
  try {
    props = el.dataset.trackProps ? (JSON.parse(el.dataset.trackProps) as object) : {};
  } catch {
    // Malformed attributes are our bug, not the visitor's; send the event without props.
  }
  // The name and props were typed when trackClick built the attributes.
  send(el.dataset.track, props, true);
}

export type { AnalyticsEvents };
