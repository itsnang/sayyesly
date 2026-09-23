// Points the Telegram bot at this app's webhook, with the secret Telegram
// sends back in X-Telegram-Bot-Api-Secret-Token.
//
//   bun run telegram:webhook          (uses NEXT_PUBLIC_APP_URL; must be public https)
//   bun run telegram:webhook --info   (shows the current webhook status)

const { TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, NEXT_PUBLIC_APP_URL } = process.env;
if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not set");

const api = (method: string, body?: object) =>
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  }).then((r) => r.json());

if (process.argv.includes("--info")) {
  console.log(await api("getWebhookInfo"));
} else {
  if (!TELEGRAM_WEBHOOK_SECRET || !/^[A-Za-z0-9_-]{1,256}$/.test(TELEGRAM_WEBHOOK_SECRET)) {
    throw new Error("TELEGRAM_WEBHOOK_SECRET must be 1-256 chars of A-Z, a-z, 0-9, _ or -");
  }
  if (!NEXT_PUBLIC_APP_URL?.startsWith("https://")) {
    throw new Error("NEXT_PUBLIC_APP_URL must be a public https URL for Telegram to reach");
  }
  const url = new URL("/api/telegram/webhook", NEXT_PUBLIC_APP_URL).toString();
  console.log(
    await api("setWebhook", {
      url,
      secret_token: TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ["message", "my_chat_member"],
      drop_pending_updates: true,
    }),
  );
  console.log(`Webhook set to ${url}`);
}

export {};
