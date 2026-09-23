import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { handleCutluyEvent } from "@/features/billing/handle-webhook";
import { verifyCutluySignature } from "@/features/billing/utils/cutluy-webhook";

// POST /api/cutluy/webhook — register this URL in the CutLuy dashboard.
export async function POST(req: NextRequest) {
  const secret = env.CUTLUY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  // Verify against the exact bytes CutLuy signed, before parsing anything.
  const rawBody = await req.text();
  const valid = verifyCutluySignature({
    header: req.headers.get("x-cutluy-signature"),
    rawBody,
    secret,
    now: new Date(),
  });
  if (!valid) return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const outcome = await handleCutluyEvent(body);
  return NextResponse.json({ message: outcome.message }, { status: outcome.status });
}
