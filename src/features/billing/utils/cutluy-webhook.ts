import { createHmac, timingSafeEqual } from "node:crypto";

const TOLERANCE_MS = 5 * 60_000;

/** Whether CutLuy's decimal USD amount (e.g. "1.99") is exactly `cents`. No floats involved. */
export function amountMatchesCents(amount: string, cents: number): boolean {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(amount);
  if (!match) return false;
  const [, dollars, fraction = ""] = match;
  return Number(dollars) * 100 + Number(fraction.padEnd(2, "0")) === cents;
}

/** Dollars as CutLuy expects them in a request: 199 → 1.99. */
export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

type VerifyInput = { header: string | null; rawBody: string; secret: string; now: Date };

/**
 * Checks CutLuy's `X-CutLuy-Signature: t=<timestamp>,v1=<hex>` header:
 * HMAC-SHA256 of `${t}.${rawBody}` with the endpoint's signing secret,
 * compared in constant time, and only within 5 minutes of `t`.
 * https://cutluy.com/docs (Webhooks → Verify signatures)
 */
export function verifyCutluySignature({ header, rawBody, secret, now }: VerifyInput): boolean {
  const parts = new Map(
    (header ?? "").split(",").map((part) => {
      const i = part.indexOf("=");
      return [part.slice(0, i).trim(), part.slice(i + 1).trim()] as const;
    }),
  );
  const t = parts.get("t");
  const v1 = parts.get("v1");
  if (!t || !/^\d+$/.test(t) || !v1 || !/^[0-9a-f]{64}$/i.test(v1)) return false;

  // Unix seconds per the docs; tolerate milliseconds too.
  const signedAtMs = t.length > 11 ? Number(t) : Number(t) * 1000;
  if (Math.abs(now.getTime() - signedAtMs) > TOLERANCE_MS) return false;

  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest();
  const received = Buffer.from(v1, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
