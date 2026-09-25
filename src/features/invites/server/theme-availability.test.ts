import { describe, expect, test } from "bun:test";
import { isThemeOffered, isThemeUsable, type ThemeAvailability } from "./theme-availability";

const offered: ThemeAvailability = { isActive: true, priceCents: 0 };
const paidOffered: ThemeAvailability = { isActive: true, priceCents: 199 };
const hidden: ThemeAvailability = { isActive: false, priceCents: 199 };
const hiddenFree: ThemeAvailability = { isActive: false, priceCents: 0 };

describe("isThemeOffered", () => {
  test("a Theme on offer is offered whether or not it's owned", () => {
    expect(isThemeOffered(offered, false)).toBe(true);
    expect(isThemeOffered(paidOffered, false)).toBe(true);
    expect(isThemeOffered(paidOffered, true)).toBe(true);
  });

  test("a hidden Theme the Creator owns is still offered", () => {
    expect(isThemeOffered(hidden, true)).toBe(true);
  });

  test("a hidden Theme the Creator doesn't own is not offered", () => {
    expect(isThemeOffered(hidden, false)).toBe(false);
    expect(isThemeOffered(hiddenFree, false)).toBe(false);
  });
});

describe("isThemeUsable", () => {
  test("a free Theme on offer is usable by anyone", () => {
    expect(isThemeUsable(offered, false)).toBe(true);
  });

  test("a Paid theme on offer is not usable until it's owned", () => {
    expect(isThemeUsable(paidOffered, false)).toBe(false);
    expect(isThemeUsable(paidOffered, true)).toBe(true);
  });

  test("owning a Theme that's since been hidden still makes it usable", () => {
    expect(isThemeUsable(hidden, true)).toBe(true);
  });

  test("not owning a hidden Theme makes it unusable, free or not", () => {
    expect(isThemeUsable(hidden, false)).toBe(false);
    expect(isThemeUsable(hiddenFree, false)).toBe(false);
  });
});
