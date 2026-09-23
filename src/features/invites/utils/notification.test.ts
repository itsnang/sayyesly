import { describe, expect, test } from "bun:test";
import { answerNotification } from "./notification";

const base = {
  recipientName: "Sreyneang",
  place: "mauu steak",
  mapUrl: "https://maps.app.goo.gl/abc",
  timezone: "Asia/Phnom_Penh",
  note: null,
  noDodges: 3,
};

describe("answerNotification", () => {
  test("a yes names the Recipient, the place, the date and time in the Invite's zone, and the dodges", () => {
    const text = answerNotification({
      ...base,
      answer: "yes",
      startsAt: new Date("2026-09-25T12:00:00Z"), // Fri 19:00 in Phnom Penh
    });
    expect(text).toBe(
      [
        "🎉 <b>Sreyneang said YES!</b>",
        "",
        "📅 <b>Friday, September 25</b> · 7:00 PM",
        "📍 mauu steak",
        "🗺 https://maps.app.goo.gl/abc",
        "",
        "(Sreyneang tried to click No 3 times 😂)",
      ].join("\n"),
    );
  });

  test("no dodge line when the Recipient never tried No, and singular for one try", () => {
    const yes = { ...base, answer: "yes" as const, startsAt: new Date("2026-09-25T12:00:00Z") };
    expect(answerNotification({ ...yes, noDodges: 0 })).not.toContain("tried to click No");
    expect(answerNotification({ ...yes, noDodges: 1 })).toContain("(Sreyneang tried to click No once 😂)");
  });

  test("maybe later is a gentle message, with no YES, no plan and no dodge teasing", () => {
    const text = answerNotification({ ...base, answer: "maybe_later", startsAt: null, noDodges: 9 });
    expect(text).toBe(
      [
        "💌 <b>Sreyneang said maybe another time.</b>",
        "",
        "Not a no, just not now. Be kind to yourself 🌷",
      ].join("\n"),
    );
  });

  test("the Recipient's Note is quoted in both kinds of message", () => {
    const yes = answerNotification({ ...base, answer: "yes", startsAt: new Date("2026-09-25T12:00:00Z"), note: "hi :)" });
    const later = answerNotification({ ...base, answer: "maybe_later", startsAt: null, note: "busy month" });
    expect(yes).toContain('💬 <i>"hi :)"</i>');
    expect(later).toContain('💬 <i>"busy month"</i>');
  });

  test("HTML typed by users is shown as text, not interpreted by Telegram", () => {
    const text = answerNotification({
      ...base,
      recipientName: "<b>Bo</b>",
      answer: "yes",
      startsAt: null,
      place: "A & B's",
      note: "</i><a href='x'>click</a>",
    });
    expect(text).toContain("🎉 <b>&lt;b&gt;Bo&lt;/b&gt; said YES!</b>");
    expect(text).toContain("📍 A &amp; B's");
    expect(text).toContain("&lt;/i&gt;&lt;a href='x'&gt;click&lt;/a&gt;");
  });

  test("an Invite with no Recipient name still reads naturally", () => {
    const yes = answerNotification({ ...base, recipientName: "  ", answer: "yes", startsAt: null, noDodges: 2 });
    expect(yes).toBe(
      [
        "🎉 <b>They said YES!</b>",
        "",
        "📍 mauu steak",
        "🗺 https://maps.app.goo.gl/abc",
        "",
        "(They tried to click No 2 times 😂)",
      ].join("\n"),
    );
    const later = answerNotification({ ...base, recipientName: "", answer: "maybe_later", startsAt: null });
    expect(later.split("\n")[0]).toBe("💌 <b>They said maybe another time.</b>");
  });
});
