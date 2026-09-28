import { describe, expect, test } from "bun:test";
import { sanitizeEvent } from "./sanitize";

type Props = Record<string, unknown>;
const pageview = (properties: Props, extra: { $set_once?: Props } = {}) => ({ event: "$pageview", properties, ...extra });

describe("sanitizeEvent", () => {
  test("an Invite's link never leaves the browser: its slug becomes [slug]", () => {
    const out = sanitizeEvent(
      pageview({
        $current_url: "https://sayyesly.site/invite/M8rqKCdVS6",
        $pathname: "/invite/M8rqKCdVS6",
      }),
    );
    expect(out?.properties).toEqual({
      $current_url: "https://sayyesly.site/invite/[slug]",
      $pathname: "/invite/[slug]",
    });
  });

  test("the old /i/ share links are rewritten the same way", () => {
    const out = sanitizeEvent(pageview({ $pathname: "/i/M8rqKCdVS6" }));
    expect(out?.properties.$pathname).toBe("/i/[slug]");
  });

  test("query strings and fragments are dropped from URLs and referrers", () => {
    const out = sanitizeEvent(
      pageview({
        $current_url: "https://sayyesly.site/dashboard/invites/new?created=1#share",
        $referrer: "https://sayyesly.site/login?next=%2Finvite%2FM8rqKCdVS6",
      }),
    );
    expect(out?.properties).toEqual({
      $current_url: "https://sayyesly.site/dashboard/invites/new",
      $referrer: "https://sayyesly.site/login",
    });
  });

  test("a referrer or first-visit URL pointing at an Invite is rewritten too, in person properties as well", () => {
    const out = sanitizeEvent(
      pageview(
        { $referrer: "https://sayyesly.site/invite/abc123XYZ0", $initial_current_url: "https://sayyesly.site/invite/abc123XYZ0?x=1" },
        { $set_once: { $initial_referrer: "https://sayyesly.site/invite/abc123XYZ0", $initial_pathname: "/invite/abc123XYZ0" } },
      ),
    );
    expect(out?.properties).toEqual({
      $referrer: "https://sayyesly.site/invite/[slug]",
      $initial_current_url: "https://sayyesly.site/invite/[slug]",
    });
    expect(out?.$set_once).toEqual({
      $initial_referrer: "https://sayyesly.site/invite/[slug]",
      $initial_pathname: "/invite/[slug]",
    });
  });

  test("the page title is dropped: on an Invite it's the question", () => {
    const out = sanitizeEvent(pageview({ title: "will you have dinner with me?", $title: "x", $pathname: "/demo" }));
    expect(out?.properties).toEqual({ $pathname: "/demo" });
  });

  test("other pages and properties pass through unchanged", () => {
    const props = { $pathname: "/dashboard/invites/new", $current_url: "https://sayyesly.site/", theme: "envelope", location: "hero", $lib: "web" };
    expect(sanitizeEvent(pageview(props))?.properties).toEqual(props);
  });

  test("a dropped event stays dropped", () => {
    expect(sanitizeEvent(null)).toBeNull();
  });
});
