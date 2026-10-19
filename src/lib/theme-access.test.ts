import { describe, expect, test } from "bun:test";
import { isThemeOffered, isThemeUsable, type ThemeAccess } from "./theme-access";

const free = { id: "free", isActive: true, priceCents: 0 };
const paid = { id: "paid", isActive: true, priceCents: 199 };
const hidden = { id: "hidden", isActive: false, priceCents: 199 };
const hiddenFree = { id: "hidden-free", isActive: false, priceCents: 0 };

const creator: ThemeAccess = { owned: new Set(), tester: false };
const owns = (...ids: string[]): ThemeAccess => ({ owned: new Set(ids), tester: false });
const tester: ThemeAccess = { owned: new Set(), tester: true };

describe("isThemeOffered", () => {
  test("a Theme on offer is offered whether or not it's owned", () => {
    expect(isThemeOffered(free, creator)).toBe(true);
    expect(isThemeOffered(paid, creator)).toBe(true);
    expect(isThemeOffered(paid, owns("paid"))).toBe(true);
  });

  test("a hidden Theme the Creator owns is still offered", () => {
    expect(isThemeOffered(hidden, owns("hidden"))).toBe(true);
  });

  test("a hidden Theme the Creator doesn't own is not offered", () => {
    expect(isThemeOffered(hidden, creator)).toBe(false);
    expect(isThemeOffered(hiddenFree, creator)).toBe(false);
  });

  test("a Tester sees the same catalogue: hidden Themes they don't own stay out", () => {
    expect(isThemeOffered(hidden, tester)).toBe(false);
    expect(isThemeOffered(paid, tester)).toBe(true);
  });
});

describe("isThemeUsable", () => {
  test("a free Theme on offer is usable by anyone", () => {
    expect(isThemeUsable(free, creator)).toBe(true);
    expect(isThemeUsable(free, tester)).toBe(true);
  });

  test("a Theme on sale for free is usable by anyone: only its current price counts", () => {
    const onSale = { id: "sale", isActive: true, priceCents: 0, regularPriceCents: 199 };
    expect(isThemeUsable(onSale, creator)).toBe(true);
  });

  test("a Paid theme on offer is not usable until it's owned", () => {
    expect(isThemeUsable(paid, creator)).toBe(false);
    expect(isThemeUsable(paid, owns("paid"))).toBe(true);
  });

  test("owning a Theme that's since been hidden still makes it usable", () => {
    expect(isThemeUsable(hidden, owns("hidden"))).toBe(true);
  });

  test("not owning a hidden Theme makes it unusable, free or not", () => {
    expect(isThemeUsable(hidden, creator)).toBe(false);
    expect(isThemeUsable(hiddenFree, creator)).toBe(false);
  });

  test("a Tester can use a Paid theme on offer without owning it", () => {
    expect(isThemeUsable(paid, tester)).toBe(true);
  });

  test("a Tester can't use a hidden Theme they don't own, Paid or free", () => {
    expect(isThemeUsable(hidden, tester)).toBe(false);
    expect(isThemeUsable(hiddenFree, tester)).toBe(false);
  });

  test("a Tester keeps a hidden Theme they bought", () => {
    expect(isThemeUsable(hidden, { owned: new Set(["hidden"]), tester: true })).toBe(true);
  });

  test("a former Tester can use only what they bought", () => {
    const former: ThemeAccess = { owned: new Set(["other"]), tester: false };
    expect(isThemeUsable(paid, former)).toBe(false);
    expect(isThemeUsable({ ...paid, id: "other" }, former)).toBe(true);
  });
});
