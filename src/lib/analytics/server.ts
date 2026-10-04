import "server-only";
import { PostHog } from "posthog-node";
import type { LogContext } from "@/lib/logger/logger";
import { posthogHosts } from "./posthog-host";
import { sanitizeEvent } from "./sanitize";

// Same project key as the browser's (public by design); off when it isn't set.
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!key) return null;
  // Serverless functions freeze after responding: send each event at once, don't batch.
  client ??= new PostHog(key, {
    host: posthogHosts(process.env.NEXT_PUBLIC_POSTHOG_HOST).ingest,
    flushAt: 1,
    flushInterval: 0,
    before_send: (event) => (event ? { ...event, properties: sanitizeEvent({ properties: event.properties ?? {} })?.properties ?? {} } : null),
  });
  return client;
}

/**
 * Sends a server error to PostHog. Anonymous like the browser side: one
 * constant distinct id and no Person profile, so the Creator id (when the
 * caller has one) is only an event property. Never throws.
 */
export async function reportServerException(error: unknown, props: LogContext): Promise<void> {
  try {
    await getClient()?.captureExceptionImmediate(error, "server", { $process_person_profile: false, ...props });
  } catch {
    // Error tracking being down must not become another error.
  }
}
