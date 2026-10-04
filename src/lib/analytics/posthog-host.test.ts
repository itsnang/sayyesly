import { describe, expect, test } from "bun:test";
import { posthogHosts } from "./posthog-host";

describe("posthogHosts", () => {
  test("derives the other PostHog hosts from the ingestion host", () => {
    expect(posthogHosts("https://us.i.posthog.com")).toEqual({
      ingest: "https://us.i.posthog.com",
      assets: "https://us-assets.i.posthog.com",
      app: "https://us.posthog.com",
    });
    expect(posthogHosts("https://eu.i.posthog.com").assets).toBe("https://eu-assets.i.posthog.com");
  });

  test("falls back to the US cloud when unset, blank or not a PostHog cloud host", () => {
    for (const value of [undefined, "", "https://ph.example.com"]) {
      expect(posthogHosts(value).ingest).toBe("https://us.i.posthog.com");
    }
  });

  test("ignores a trailing slash", () => {
    expect(posthogHosts("https://eu.i.posthog.com/").ingest).toBe("https://eu.i.posthog.com");
  });
});
