import { describe, expect, test } from "bun:test";
import { diffTimeSlots } from "./time-slots";

const NOW = Date.parse("2026-10-01T12:00:00Z");
const at = (iso: string) => new Date(iso);

describe("diffTimeSlots", () => {
  test("the same times, even to the second, change nothing (the form edits whole minutes)", () => {
    const current = [{ id: "a", startsAt: at("2026-10-05T18:30:42Z") }];
    expect(diffTimeSlots(current, [at("2026-10-05T18:30:00Z")], NOW)).toEqual({ ok: true, add: [], remove: [] });
  });

  test("a new future time is added and a dropped one removed", () => {
    const current = [
      { id: "keep", startsAt: at("2026-10-05T18:30:00Z") },
      { id: "drop", startsAt: at("2026-10-06T18:30:00Z") },
    ];
    const result = diffTimeSlots(current, [at("2026-10-05T18:30:00Z"), at("2026-10-07T19:00:00Z")], NOW);
    expect(result).toEqual({ ok: true, add: [at("2026-10-07T19:00:00Z")], remove: ["drop"] });
  });

  test("a time added in the past is refused", () => {
    expect(diffTimeSlots([], [at("2026-09-30T18:00:00Z")], NOW)).toEqual({ ok: false });
    expect(diffTimeSlots([], [at("2026-10-01T12:00:00Z")], NOW)).toEqual({ ok: false });
  });

  test("a time that has since passed can stay: only new times must be in the future", () => {
    const current = [{ id: "old", startsAt: at("2026-09-30T18:00:00Z") }];
    expect(diffTimeSlots(current, [at("2026-09-30T18:00:00Z")], NOW)).toEqual({ ok: true, add: [], remove: [] });
  });

  test("the same new time twice is added once", () => {
    const twice = [at("2026-10-07T19:00:00Z"), at("2026-10-07T19:00:30Z")];
    expect(diffTimeSlots([], twice, NOW)).toEqual({ ok: true, add: [at("2026-10-07T19:00:00Z")], remove: [] });
  });
});
