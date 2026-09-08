import { NextRequest, NextResponse } from "next/server";

interface TelegramPayload {
  date: string;
  time: string;
  place: string;
  note: string | null;
}

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ error: "Telegram not configured" }, { status: 500 });
  }

  const body = (await req.json()) as TelegramPayload;
  const lines = [
    `♥ <b>she said yes!</b>`,
    ``,
    `📅 <b>${body.date}</b>  ·  ${body.time}`,
    `📍 ${body.place}`,
    `🗺 https://maps.app.goo.gl/2UQ6SB6ctfqXjzBc7`,
  ];
  if (body.note) {
    lines.push(``, `💬 <i>"${body.note}"</i>`);
  }
  lines.push(``, `<i>// she said yes 🌷</i>`);
  const text = lines.join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
