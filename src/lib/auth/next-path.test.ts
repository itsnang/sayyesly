import { describe, expect, test } from "bun:test";
import { safeNextPath } from "./next-path";

describe("safeNextPath", () => {
  test("keeps same-site paths, with their query", () => {
    expect(safeNextPath("/dashboard/invites/new")).toBe("/dashboard/invites/new");
    expect(safeNextPath("/dashboard?created=1")).toBe("/dashboard?created=1");
  });

  test("falls back when there's nothing usable", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath("")).toBe("/dashboard");
    expect(safeNextPath("dashboard", "/x")).toBe("/x");
  });

  test("refuses anything that leaves the site", () => {
    for (const next of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/\t/evil.example", // browsers drop tabs and newlines, making it //evil.example
      "/\n/evil.example",
      "/\r/evil.example",
      "/%09/evil.example".replace("%09", "\t"),
      "/ /evil.example",
      "/\\/evil.example",
      "javascript:alert(1)",
    ]) {
      expect(safeNextPath(next)).toBe("/dashboard");
    }
  });
});
