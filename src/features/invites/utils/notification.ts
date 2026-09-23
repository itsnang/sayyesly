import { escapeHtml } from "@/lib/telegram/html";

export type AnswerNotificationInput = {
  recipientName: string;
  answer: "yes" | "maybe_later";
  startsAt: Date | null;
  timezone: string;
  place: string | null;
  mapUrl: string | null;
  note: string | null;
  noDodges: number;
};

/** The Telegram message (HTML parse mode) telling the Creator and Linked groups about an Answer. */
export function answerNotification(input: AnswerNotificationInput): string {
  // The Recipient name is optional; without one the message says "They".
  const name = input.recipientName.trim() ? escapeHtml(input.recipientName.trim()) : "They";
  const note = input.note ? `💬 <i>"${escapeHtml(input.note)}"</i>` : null;

  if (input.answer === "maybe_later") {
    const lines = [`💌 <b>${name} said maybe another time.</b>`, ""];
    if (note) lines.push(note, "");
    lines.push("Not a no, just not now. Be kind to yourself 🌷");
    return lines.join("\n");
  }

  const lines = [`🎉 <b>${name} said YES!</b>`, ""];
  if (input.startsAt) {
    const date = new Intl.DateTimeFormat("en-US", {
      timeZone: input.timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(input.startsAt);
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: input.timezone,
      hour: "numeric",
      minute: "2-digit",
    }).format(input.startsAt);
    lines.push(`📅 <b>${date}</b> · ${time}`);
  }
  if (input.place) lines.push(`📍 ${escapeHtml(input.place)}`);
  if (input.mapUrl) lines.push(`🗺 ${escapeHtml(input.mapUrl)}`);
  if (note) lines.push("", note);
  if (input.noDodges > 0) lines.push("", `(${name} tried to click No ${tries(input.noDodges)} 😂)`);

  return lines.join("\n");
}

function tries(n: number): string {
  return n === 1 ? "once" : `${n} times`;
}
