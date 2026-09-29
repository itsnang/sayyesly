import { describe, expect, test } from "bun:test";
import { isExpired, resolveAnswer, type AnswerableInvite } from "./answer";

const NOW = new Date("2026-09-23T05:00:00Z"); // 12:00 in Phnom Penh

const invite: AnswerableInvite = {
  timezone: "Asia/Phnom_Penh",
  allowCustomTime: false,
  timeSlots: [
    { id: "past", startsAt: new Date("2026-09-22T12:00:00Z") },
    { id: "fri", startsAt: new Date("2026-09-25T12:00:00Z") },
  ],
};

describe("resolveAnswer", () => {
  test("yes with an offered Time slot agrees on that slot's moment", () => {
    const result = resolveAnswer(
      invite,
      { answer: "yes", choice: { kind: "slot", timeSlotId: "fri" }, note: null, noDodges: 3 },
      NOW,
    );
    expect(result).toEqual({
      ok: true,
      value: {
        kind: "yes",
        timeSlotId: "fri",
        startsAt: new Date("2026-09-25T12:00:00Z"),
        note: null,
        noDodges: 3,
      },
    });
  });

  test("a Time slot that has already passed can't be chosen", () => {
    const result = resolveAnswer(
      invite,
      { answer: "yes", choice: { kind: "slot", timeSlotId: "past" }, note: null, noDodges: 0 },
      NOW,
    );
    expect(result.ok).toBe(false);
  });

  test("a Time slot from another Invite can't be chosen", () => {
    const result = resolveAnswer(
      invite,
      { answer: "yes", choice: { kind: "slot", timeSlotId: "someone-elses-slot" }, note: null, noDodges: 0 },
      NOW,
    );
    expect(result.ok).toBe(false);
  });

  test("a Custom time is read in the Invite's time zone, not the viewer's", () => {
    const result = resolveAnswer(
      { ...invite, allowCustomTime: true },
      { answer: "yes", choice: { kind: "custom", date: "2026-09-25", time: "19:00" }, note: "hi", noDodges: 0 },
      NOW,
    );
    // 19:00 in Phnom Penh (UTC+7) is 12:00 UTC
    expect(result).toEqual({
      ok: true,
      value: { kind: "yes", timeSlotId: null, startsAt: new Date("2026-09-25T12:00:00Z"), note: "hi", noDodges: 0 },
    });
  });

  test("a Custom time is refused when the Invite doesn't allow one", () => {
    const result = resolveAnswer(
      invite,
      { answer: "yes", choice: { kind: "custom", date: "2026-09-25", time: "19:00" }, note: null, noDodges: 0 },
      NOW,
    );
    expect(result.ok).toBe(false);
  });

  test("a Custom time in the past is refused", () => {
    const result = resolveAnswer(
      { ...invite, allowCustomTime: true },
      // 11:00 today in Phnom Penh, an hour before NOW
      { answer: "yes", choice: { kind: "custom", date: "2026-09-23", time: "11:00" }, note: null, noDodges: 0 },
      NOW,
    );
    expect(result.ok).toBe(false);
  });

  test("a Custom time follows daylight saving in the Invite's time zone", () => {
    const newYork = { ...invite, timezone: "America/New_York", allowCustomTime: true };
    const summer = resolveAnswer(
      newYork,
      { answer: "yes", choice: { kind: "custom", date: "2026-10-10", time: "19:00" }, note: null, noDodges: 0 },
      NOW,
    );
    const winter = resolveAnswer(
      newYork,
      { answer: "yes", choice: { kind: "custom", date: "2026-11-10", time: "19:00" }, note: null, noDodges: 0 },
      NOW,
    );
    // EDT is UTC-4, EST is UTC-5
    expect(summer.ok && summer.value.startsAt).toEqual(new Date("2026-10-10T23:00:00Z"));
    expect(winter.ok && winter.value.startsAt).toEqual(new Date("2026-11-11T00:00:00Z"));
  });

  test("maybe later needs no time and keeps the dodge count", () => {
    const result = resolveAnswer(invite, { answer: "maybe_later", note: null, noDodges: 7 }, NOW);
    expect(result).toEqual({
      ok: true,
      value: { kind: "maybe_later", timeSlotId: null, startsAt: null, note: null, noDodges: 7 },
    });
  });

  test("input that doesn't have the right shape is refused, not thrown", () => {
    expect(resolveAnswer(invite, { answer: "no" }, NOW).ok).toBe(false);
    expect(resolveAnswer(invite, null, NOW).ok).toBe(false);
  });

  test("the Note is trimmed, blank becomes none, and a very long one is refused", () => {
    const trimmed = resolveAnswer(invite, { answer: "maybe_later", note: "  hi :)  ", noDodges: 0 }, NOW);
    const blank = resolveAnswer(invite, { answer: "maybe_later", note: "   ", noDodges: 0 }, NOW);
    const long = resolveAnswer(invite, { answer: "maybe_later", note: "x".repeat(501), noDodges: 0 }, NOW);
    expect(trimmed.ok && trimmed.value.note).toBe("hi :)");
    expect(blank.ok && blank.value.note).toBeNull();
    expect(long.ok).toBe(false);
  });

  test("a made-up dodge count is kept within 0–999", () => {
    const negative = resolveAnswer(invite, { answer: "maybe_later", note: null, noDodges: -4 }, NOW);
    const huge = resolveAnswer(invite, { answer: "maybe_later", note: null, noDodges: 1_000_000 }, NOW);
    expect(negative.ok && negative.value.noDodges).toBe(0);
    expect(huge.ok && huge.value.noDodges).toBe(999);
  });

  test("an Expired Invite can't be answered, not even with maybe later", () => {
    const expired = { ...invite, timeSlots: [{ id: "past", startsAt: new Date("2026-09-22T12:00:00Z") }] };
    expect(isExpired(expired, NOW)).toBe(true);
    expect(resolveAnswer(expired, { answer: "maybe_later", note: null, noDodges: 0 }, NOW).ok).toBe(false);
  });

  test("an Invite with no Time slots left but Custom time allowed is not Expired", () => {
    const open = { ...invite, allowCustomTime: true, timeSlots: [] };
    expect(isExpired(open, NOW)).toBe(false);
  });

  test("a Custom time that isn't a real date is refused", () => {
    const result = resolveAnswer(
      { ...invite, allowCustomTime: true },
      { answer: "yes", choice: { kind: "custom", date: "2026-02-30", time: "19:00" }, note: null, noDodges: 0 },
      NOW,
    );
    expect(result.ok).toBe(false);
  });
});
