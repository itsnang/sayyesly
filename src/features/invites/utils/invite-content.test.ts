import { describe, expect, test } from "bun:test";
import { AnswerKind, TimeOfDay } from "@/lib/enums";
import { InviteStatus } from "../enums";
import type { InviteFormValues } from "../schemas";
import { formToSaved, inviteState, previewInvite, toPublicInvite, type SavedInvite } from "./invite-content";

const NOW = new Date("2026-10-01T12:00:00Z");
const slot = (id: string, iso: string) => ({ id, startsAt: new Date(iso) });
const PAST = slot("past", "2026-09-30T18:00:00Z");
const SOON = slot("soon", "2026-10-02T18:00:00Z");
const LATER = slot("later", "2026-10-09T18:00:00Z");

describe("inviteState", () => {
  test("an unanswered Invite with an upcoming Time slot is Waiting, and lists only upcoming slots, soonest first", () => {
    const state = inviteState({ allowCustomTime: false, timeSlots: [LATER, PAST, SOON], answer: null }, NOW);
    expect(state).toEqual({ status: InviteStatus.Waiting, outOfTimes: false, upcomingSlots: [SOON, LATER] });
  });

  test("every Time slot passed and no Custom time: Expired", () => {
    const state = inviteState({ allowCustomTime: false, timeSlots: [PAST], answer: null }, NOW);
    expect(state).toEqual({ status: InviteStatus.Expired, outOfTimes: true, upcomingSlots: [] });
  });

  test("a Custom time keeps an Invite with only past Time slots Waiting", () => {
    const state = inviteState({ allowCustomTime: true, timeSlots: [PAST], answer: null }, NOW);
    expect(state.status).toBe(InviteStatus.Waiting);
    expect(state.outOfTimes).toBe(false);
  });

  test("an Answer beats Expired, but the Invite still says it's out of times (for Reopen's warning)", () => {
    const state = inviteState({ allowCustomTime: false, timeSlots: [PAST], answer: { kind: AnswerKind.MaybeLater } }, NOW);
    expect(state).toEqual({ status: InviteStatus.MaybeLater, outOfTimes: true, upcomingSlots: [] });
  });

  test("a slot starting right now has passed", () => {
    const state = inviteState({ allowCustomTime: false, timeSlots: [slot("now", NOW.toISOString())], answer: null }, NOW);
    expect(state.status).toBe(InviteStatus.Expired);
  });
});

const SAVED: SavedInvite = {
  slug: "abc123",
  themeId: "kitten-soft",
  recipientName: "Dara",
  question: "will you have *dinner* with me?",
  message: "wear comfy shoes",
  imageUrl: null,
  planPlace: "Riverside",
  planActivity: null,
  planMapUrl: "https://maps.example/riverside",
  planDressCode: null,
  planNotes: null,
  planPhotos: [{ url: "https://img.example/1.jpg", alt: "the river" }],
  songUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  songStart: 42,
  songLength: 15,
  timezone: "Asia/Phnom_Penh",
  allowCustomTime: false,
  timeOfDay: TimeOfDay.Evening,
  timeSlots: [LATER, PAST, SOON],
};

describe("toPublicInvite", () => {
  test("shows the Recipient the Invite's content, its upcoming Time slots and its Song's chosen part", () => {
    expect(toPublicInvite(SAVED, null, NOW)).toEqual({
      slug: "abc123",
      themeId: "kitten-soft",
      recipientName: "Dara",
      question: [
        { text: "will you have ", emphasis: false },
        { text: "dinner", emphasis: true },
        { text: " with me?", emphasis: false },
      ],
      message: "wear comfy shoes",
      imageUrl: null,
      plan: {
        place: "Riverside",
        activity: null,
        mapUrl: "https://maps.example/riverside",
        dressCode: null,
        notes: null,
        photos: [{ url: "https://img.example/1.jpg", alt: "the river" }],
      },
      timezone: "Asia/Phnom_Penh",
      timeSlots: [
        { id: "soon", startsAt: "2026-10-02T18:00:00.000Z" },
        { id: "later", startsAt: "2026-10-09T18:00:00.000Z" },
      ],
      allowCustomTime: false,
      timeOfDay: TimeOfDay.Evening,
      song: { id: "dQw4w9WgXcQ", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", start: 42, length: 15 },
      answer: null,
      expired: false,
    });
  });

  test("a map link that isn't http(s) is never shown", () => {
    expect(toPublicInvite({ ...SAVED, planMapUrl: "javascript:alert(1)" }, null, NOW).plan.mapUrl).toBeNull();
  });

  test("an unanswered Invite out of times is Expired; once answered it shows the Answer instead", () => {
    const outOfTimes = { ...SAVED, timeSlots: [PAST] };
    expect(toPublicInvite(outOfTimes, null, NOW).expired).toBe(true);
    const answered = toPublicInvite(outOfTimes, { kind: AnswerKind.Yes, startsAt: PAST.startsAt, note: "yay" }, NOW);
    expect(answered.expired).toBe(false);
    expect(answered.answer).toEqual({ answer: AnswerKind.Yes, startsAt: "2026-09-30T18:00:00.000Z", note: "yay" });
  });
});

// The same Invite as SAVED, as the studio's form holds it (times in Phnom Penh, UTC+7).
const FORM: InviteFormValues = {
  themeId: "kitten-soft",
  recipientName: "Dara",
  question: "will you have *dinner* with me?",
  message: "wear comfy shoes",
  imageUrl: "",
  planPlace: "Riverside",
  planActivity: "",
  planMapUrl: "https://maps.example/riverside",
  planDressCode: "",
  planNotes: "",
  planPhotos: [{ url: "https://img.example/1.jpg", alt: "the river", caption: "" }],
  songUrl: "https://youtu.be/dQw4w9WgXcQ?si=share",
  songStart: 42,
  songLength: 15,
  timezone: "Asia/Phnom_Penh",
  allowCustomTime: false,
  timeOfDay: TimeOfDay.Evening,
  timeSlots: [
    { date: "2026-10-10", time: "01:00" }, // LATER
    { date: "2026-10-01", time: "01:00" }, // PAST
    { date: "2026-10-03", time: "01:00" }, // SOON
  ],
};

describe("formToSaved", () => {
  test("saves empty text as null, the Song link in its one canonical form, and the times as instants", () => {
    const { content, timeSlots, allTimesReal } = formToSaved(FORM);
    expect({ ...content, slug: SAVED.slug, timeSlots: SAVED.timeSlots }).toEqual(SAVED);
    expect(timeSlots).toEqual([LATER.startsAt, PAST.startsAt, SOON.startsAt]);
    expect(allTimesReal).toBe(true);
  });

  test("Let them pick saves no Time slots, whatever times are still in the form", () => {
    const saved = formToSaved({ ...FORM, allowCustomTime: true });
    expect(saved.timeSlots).toEqual([]);
    expect(saved.content.allowCustomTime).toBe(true);
  });

  test("a time that isn't a real date is reported, and left out", () => {
    const saved = formToSaved({ ...FORM, timeSlots: [{ date: "2026-02-30", time: "19:00" }, FORM.timeSlots[0]!] });
    expect(saved.allTimesReal).toBe(false);
    expect(saved.timeSlots).toEqual([LATER.startsAt]);
  });

  test("a plan photo without a description gets one; a photo row with no picture yet is left out", () => {
    const saved = formToSaved({ ...FORM, planPhotos: [{ url: "https://img.example/2.jpg", alt: "", caption: "us" }, { url: "", alt: "", caption: "" }] });
    expect(saved.content.planPhotos).toEqual([{ url: "https://img.example/2.jpg", alt: "plan photo", caption: "us" }]);
  });

  test("only the lockable columns are listed as locked once answered", () => {
    const { lockable } = formToSaved(FORM);
    expect(Object.keys(lockable).sort()).toEqual(["allowCustomTime", "question", "themeId", "timeOfDay", "timezone"]);
  });
});

describe("previewInvite", () => {
  test("the preview shows exactly what the Recipient will see once the form is saved", () => {
    const page = toPublicInvite(SAVED, null, NOW);
    const preview = previewInvite(FORM, NOW);
    expect({ ...preview, slug: page.slug, timeSlots: preview.timeSlots.map((s) => s.startsAt) }).toEqual({
      ...page,
      timeSlots: page.timeSlots.map((s) => s.startsAt),
    });
  });

  test("its Time slots get ids, so a Theme can pick one", () => {
    const ids = previewInvite(FORM, NOW).timeSlots.map((s) => s.id);
    expect(new Set(ids).size).toBe(2);
  });
});
