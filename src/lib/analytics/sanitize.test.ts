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

describe("sanitizeEvent on exceptions", () => {
  const exception = (list: unknown, extra: Props = {}) => ({ event: "$exception", properties: { $exception_list: list, ...extra } });

  test("an error's message is dropped: it can quote a name, a question or a slug", () => {
    const out = sanitizeEvent(
      exception([{ type: "Error", value: "duplicate key value violates unique constraint (slug)=(M8rqKCdVS6)", mechanism: { handled: false } }], {
        $exception_message: "boom for Lina",
        $exception_values: ["boom for Lina"],
      }),
    );
    expect(out?.properties.$exception_list).toEqual([{ type: "Error", mechanism: { handled: false } }]);
    expect(out?.properties).not.toHaveProperty("$exception_message");
    expect(out?.properties).not.toHaveProperty("$exception_values");
  });

  test("stack frames lose query strings and Invite slugs", () => {
    const out = sanitizeEvent(
      exception([
        {
          type: "TypeError",
          value: "x",
          stacktrace: {
            type: "raw",
            frames: [
              { filename: "https://sayyesly.site/_next/static/chunks/app.js?v=1", abs_path: "https://sayyesly.site/invite/M8rqKCdVS6?x=1#a", lineno: 3, function: "f" },
            ],
          },
        },
      ]),
    );
    expect(out?.properties.$exception_list).toEqual([
      {
        type: "TypeError",
        stacktrace: {
          type: "raw",
          frames: [{ filename: "https://sayyesly.site/_next/static/chunks/app.js", abs_path: "https://sayyesly.site/invite/[slug]", lineno: 3, function: "f" }],
        },
      },
    ]);
  });

  test("an exception without a list passes through", () => {
    expect(sanitizeEvent(exception(undefined))?.properties.$exception_list).toBeUndefined();
  });
});
