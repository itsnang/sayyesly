import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { handleUpdate } from "@/features/telegram-bot/server/handle-update";
import { updateSchema } from "@/features/telegram-bot/types";
import { isValidSecretToken } from "@/features/telegram-bot/server/verify";
import { logger } from "@/lib/logger";

// POST /api/telegram/webhook — registered with `bun run telegram:webhook`.
export async function POST(req: NextRequest) {
  if (!isValidSecretToken(req.headers.get("x-telegram-bot-api-secret-token"), env.TELEGRAM_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  // Updates we don't understand are acknowledged, or Telegram would keep retrying them.
  if (!parsed.success) return NextResponse.json({ ok: true });

  try {
    await handleUpdate(parsed.data);
  } catch (error) {
    logger.error("telegram_webhook.update_failed", error, { updateId: parsed.data.update_id });
  }
  return NextResponse.json({ ok: true });
}
