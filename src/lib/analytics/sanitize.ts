/**
 * What may leave the browser for analytics (PostHog's `before_send`).
 *
 * - An Invite's slug is its secret: anyone with the link can open it. Every
 *   string that holds an Invite path gets the slug replaced with `[slug]`.
 * - Query strings and fragments are dropped from URLs and referrers
 *   (`?next=`, `?created=1`, …): they're never needed and can carry anything.
 * - Page titles are dropped: an Invite's title is its question.
 *
 * Applied to the event's own properties and to the person properties PostHog
 * attaches (`$set`, `$set_once`), which repeat the first URL and referrer.
 */

type Props = Record<string, unknown>;
type Event = { properties: Props; $set?: Props | undefined; $set_once?: Props | undefined };

const INVITE_PATH = /\/(invite|i)\/[^/?#\s]+/g;
const URL_KEY = /url|referrer|pathname/i;
const TITLE_KEY = /^\$?title$/;

function clean(props: Props): Props {
  const out: Props = {};
  for (const [key, value] of Object.entries(props)) {
    if (TITLE_KEY.test(key)) continue;
    if (typeof value !== "string") {
      out[key] = value;
      continue;
    }
    const noQuery = URL_KEY.test(key) ? value.replace(/[?#].*$/, "") : value;
    out[key] = noQuery.replace(INVITE_PATH, "/$1/[slug]");
  }
  return out;
}

export function sanitizeEvent<E extends Event>(event: E | null): E | null {
  if (!event) return null;
  return {
    ...event,
    properties: clean(event.properties),
    ...(event.$set ? { $set: clean(event.$set) } : {}),
    ...(event.$set_once ? { $set_once: clean(event.$set_once) } : {}),
  };
}
