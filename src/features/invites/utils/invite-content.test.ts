import { describe, expect, test } from "bun:test";
import { AnswerKind, TimeOfDay } from "@/lib/enums";
import { InviteStatus } from "../enums";
import type { InviteFormValues } from "../schemas";
import { blankInviteForm, copyOfInvite, formToSaved, inviteState, placeToNotify, previewInvite, savedToForm, startingStops, toPublicInvite, type SavedInvite } from "./invite-content";

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
  planTitle: null,
  planStops: [],
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
        title: null,
        // No Stops saved: its one place stands in as the only Stop
        stops: [
          {
            title: "Riverside",
            line: null,
            time: null,
            description: null,
            place: "Riverside",
            mapUrl: "https://maps.example/riverside",
            photos: [{ url: "https://img.example/1.jpg", alt: "the river" }],
          },
        ],
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
  planTitle: "",
  planStops: [],
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

describe("savedToForm", () => {
  test("a saved Invite opens in the studio with the values it was saved from", () => {
    expect(savedToForm(SAVED, NOW)).toEqual({ ...FORM, songUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
  });

  test("saving it again unchanged stores the same columns", () => {
    expect(formToSaved(savedToForm(SAVED, NOW)).content).toEqual(formToSaved(FORM).content);
  });

  test("an older Invite offering both Time slots and a Custom time opens as I'll pick the times while a slot is upcoming", () => {
    expect(savedToForm({ ...SAVED, allowCustomTime: true }, NOW).allowCustomTime).toBe(false);
  });

  test("once all its Time slots have passed it opens as Let them pick, which keeps it answerable", () => {
    expect(savedToForm({ ...SAVED, allowCustomTime: true, timeSlots: [PAST] }, NOW).allowCustomTime).toBe(true);
  });
});

describe("copyOfInvite", () => {
  test("a copy keeps every field of the original, but lets them pick a time, since its old Time slots are left behind", () => {
    const copy = copyOfInvite(SAVED, SAVED.themeId, NOW);
    expect(copy.allowCustomTime).toBe(true);
    expect({ ...copy, allowCustomTime: SAVED.allowCustomTime, slug: SAVED.slug, timeSlots: SAVED.timeSlots }).toEqual(SAVED);
  });

  test("it takes the Theme it's given, for when the original's is no longer usable", () => {
    expect(copyOfInvite(SAVED, "envelope", NOW).themeId).toBe("envelope");
  });
});

describe("blankInviteForm", () => {
  test("a new Invite starts empty, in the given Theme, letting them pick an evening time, with a 30-second Song part", () => {
    expect(blankInviteForm("kitten-soft")).toEqual({
      themeId: "kitten-soft",
      recipientName: "",
      question: "",
      message: "",
      imageUrl: "",
      planPlace: "",
      planActivity: "",
      planMapUrl: "",
      planDressCode: "",
      planNotes: "",
      planPhotos: [],
      planTitle: "",
      planStops: [],
      songUrl: "",
      songStart: 0,
      songLength: 30,
      timezone: "Asia/Phnom_Penh",
      allowCustomTime: true,
      timeOfDay: TimeOfDay.Evening,
      timeSlots: [],
    });
  });

  test("takes overrides, e.g. the demo's Recipient and Plan", () => {
    const demo = blankInviteForm("envelope", { recipientName: "you", planActivity: "dinner, then a walk" });
    expect(demo).toMatchObject({ themeId: "envelope", recipientName: "you", planActivity: "dinner, then a walk", question: "" });
  });
});

// A Plan of several Stops, as saved and as the studio's form holds it.
const LUNCH = {
  title: "Lunch",
  line: "enjoy lunch",
  time: "12:00",
  description: "far too much meat",
  place: "Gogi",
  mapUrl: "https://maps.example/gogi",
  photos: [{ url: "https://img.example/bbq.jpg", alt: "stop photo", caption: "the grill" }],
};
const THRIFT = { title: "Thrift", photos: [] };
const STOPS_SAVED: SavedInvite = { ...SAVED, themeId: "binder", planTitle: "The Three Chapters", planStops: [LUNCH, THRIFT] };
const blankStop = { title: "", line: "", time: "", description: "", place: "", mapUrl: "", photos: [] };
const STOPS_FORM: InviteFormValues = {
  ...FORM,
  themeId: "binder",
  planTitle: "The Three Chapters",
  planStops: [
    { ...LUNCH, photos: [{ url: "https://img.example/bbq.jpg", alt: "stop photo", caption: "the grill" }] },
    { ...blankStop, title: "Thrift" },
  ],
};

describe("Stops", () => {
  test("saved Stops are shown in order, with safe map links and the parts left empty as null", () => {
    const plan = toPublicInvite({ ...STOPS_SAVED, planStops: [{ ...LUNCH, mapUrl: "javascript:alert(1)" }, THRIFT] }, null, NOW).plan;
    expect(plan.title).toBe("The Three Chapters");
    expect(plan.stops).toEqual([
      { ...LUNCH, mapUrl: null },
      { title: "Thrift", line: null, time: null, description: null, place: null, mapUrl: null, photos: [] },
    ]);
  });

  test("with no Stops, the one place stands in as a Stop named after what you'll do there", () => {
    const stops = toPublicInvite({ ...SAVED, planActivity: "dinner, then a walk" }, null, NOW).plan.stops;
    expect(stops.map((s) => [s.title, s.place])).toEqual([["dinner, then a walk", "Riverside"]]);
  });

  test("with no Stops and only photos planned, the stand-in Stop is called our day", () => {
    const onlyPhotos = { ...SAVED, planPlace: null, planMapUrl: null };
    expect(toPublicInvite(onlyPhotos, null, NOW).plan.stops.map((s) => s.title)).toEqual(["our day"]);
  });

  test("nothing planned at all: no Stops", () => {
    const nothing = { ...SAVED, planPlace: null, planMapUrl: null, planPhotos: [] };
    expect(toPublicInvite(nothing, null, NOW).plan.stops).toEqual([]);
  });

  test("saving leaves a Stop's empty parts out, drops photo rows with no picture yet, and stores an empty Plan title as null", () => {
    const saved = formToSaved({
      ...STOPS_FORM,
      planTitle: "",
      planStops: [{ ...blankStop, title: "Thrift", photos: [{ url: "", alt: "", caption: "" }, { url: "https://img.example/x.jpg", alt: "", caption: "" }] }],
    });
    expect(saved.content.planTitle).toBeNull();
    expect(saved.content.planStops).toEqual([{ title: "Thrift", photos: [{ url: "https://img.example/x.jpg", alt: "stop photo" }] }]);
  });

  test("an untouched empty Stop (the studio's starting card) isn't saved", () => {
    expect(formToSaved({ ...STOPS_FORM, planStops: [blankStop, { ...blankStop, title: "Thrift" }] }).content.planStops).toEqual([THRIFT]);
  });

  test("Stops round-trip: the form saves the saved Stops, and a saved Invite opens with them", () => {
    const { content } = formToSaved(STOPS_FORM);
    expect({ planTitle: content.planTitle, planStops: content.planStops }).toEqual({ planTitle: "The Three Chapters", planStops: [LUNCH, THRIFT] });
    expect(savedToForm(STOPS_SAVED, NOW)).toEqual({ ...STOPS_FORM, songUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
  });

  test("Stops and the Plan title stay editable once answered: they aren't lockable", () => {
    const { editable } = formToSaved(STOPS_FORM);
    expect(editable).toMatchObject({ planTitle: "The Three Chapters" });
    expect(editable.planStops).toHaveLength(2);
  });

  test("a copy keeps the Stops", () => {
    expect(copyOfInvite(STOPS_SAVED, "binder", NOW).planStops).toEqual([LUNCH, THRIFT]);
  });
});

describe("startingStops", () => {
  test("the studio starts from the Stops already there", () => {
    expect(startingStops(STOPS_FORM)).toEqual(STOPS_FORM.planStops);
  });

  test("with none, from the one place, so nothing the Creator typed disappears", () => {
    expect(startingStops({ ...FORM, planActivity: "dinner" })).toEqual([
      { ...blankStop, title: "dinner", place: "Riverside", mapUrl: "https://maps.example/riverside", photos: FORM.planPhotos },
    ]);
  });

  test("with nothing planned, one empty Stop ready to fill in", () => {
    expect(startingStops(blankInviteForm("binder"))).toEqual([blankStop]);
  });
});

describe("placeToNotify", () => {
  test("a single-place Theme names its place, even with Stops left over from another Theme", () => {
    expect(placeToNotify(STOPS_SAVED, false)).toEqual({ place: "Riverside", mapUrl: "https://maps.example/riverside" });
  });

  test("a Theme with several Stops names the first Stop's place, which is what the Recipient saw", () => {
    expect(placeToNotify(STOPS_SAVED, true)).toEqual({ place: "Gogi", mapUrl: "https://maps.example/gogi" });
  });

  test("with no Stops saved, the one place it showed as a Stop", () => {
    expect(placeToNotify(SAVED, true)).toEqual({ place: "Riverside", mapUrl: "https://maps.example/riverside" });
  });

  test("a first Stop without a place names none", () => {
    expect(placeToNotify({ ...STOPS_SAVED, planStops: [THRIFT] }, true)).toEqual({ place: null, mapUrl: null });
  });
});
