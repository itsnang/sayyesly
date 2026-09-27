import { describe, expect, test } from "bun:test";
import { isSameOriginRequest } from "./same-origin";

const req = (h: Record<string, string>) => new Headers(h);

describe("isSameOriginRequest", () => {
  test("accepts a form posted from our own pages", () => {
    expect(isSameOriginRequest(req({ origin: "https://sayyesly.site", host: "sayyesly.site" }))).toBe(true);
  });

  test("uses the proxy's forwarded host when there is one", () => {
    expect(isSameOriginRequest(req({ origin: "https://sayyesly.site", host: "internal:3000", "x-forwarded-host": "sayyesly.site" }))).toBe(true);
  });

  test("refuses a post from another site", () => {
    expect(isSameOriginRequest(req({ origin: "https://evil.example", host: "sayyesly.site" }))).toBe(false);
    expect(isSameOriginRequest(req({ origin: "https://sayyesly.site.evil.example", host: "sayyesly.site" }))).toBe(false);
    expect(isSameOriginRequest(req({ origin: "null", host: "sayyesly.site" }))).toBe(false);
  });

  test("without an Origin header, trusts only the browser's own same-origin marker", () => {
    expect(isSameOriginRequest(req({ host: "sayyesly.site", "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(isSameOriginRequest(req({ host: "sayyesly.site", "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(isSameOriginRequest(req({ host: "sayyesly.site" }))).toBe(false);
  });
});
