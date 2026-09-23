import { describe, expect, test } from "bun:test";
import { amountMatchesCents, verifyCutluySignature } from "./cutluy-webhook";

describe("amountMatchesCents", () => {
  test("a paid amount matches the Purchase's price exactly", () => {
    expect(amountMatchesCents("1.99", 199)).toBe(true);
    expect(amountMatchesCents("0.10", 10)).toBe(true);
    expect(amountMatchesCents("1.9", 190)).toBe(true);
    expect(amountMatchesCents("2", 200)).toBe(true);
  });

  test("any other amount, or something that isn't an amount, doesn't match", () => {
    expect(amountMatchesCents("1.99", 200)).toBe(false);
    expect(amountMatchesCents("0.01", 199)).toBe(false);
    expect(amountMatchesCents("1.989", 199)).toBe(false);
    expect(amountMatchesCents("-1.99", 199)).toBe(false);
    expect(amountMatchesCents("1,99", 199)).toBe(false);
    expect(amountMatchesCents("", 0)).toBe(false);
  });
});

// Reference signature computed independently with:
//   printf '%s' "$T.$BODY" | openssl dgst -sha256 -hmac whsec_test
const SECRET = "whsec_test";
const T = 1790139600;
const BODY =
  '{"id":"evt_1","type":"payment.completed","data":{"payment":{"id":"pay_1","status":"paid","amount":"1.99","currency":"USD","reference_id":"ref-1"}}}';
const SIG = "563bfc0198dd0aea496f65930ecc884653970edf749245c5b56e732eb965da64";
const AT = new Date(T * 1000 + 30_000); // 30 s after it was signed

describe("verifyCutluySignature", () => {
  test("accepts a genuine, fresh CutLuy signature", () => {
    expect(verifyCutluySignature({ header: `t=${T},v1=${SIG}`, rawBody: BODY, secret: SECRET, now: AT })).toBe(true);
  });

  test("rejects a body changed after signing (e.g. a bumped amount)", () => {
    const tampered = BODY.replace('"1.99"', '"0.01"');
    expect(verifyCutluySignature({ header: `t=${T},v1=${SIG}`, rawBody: tampered, secret: SECRET, now: AT })).toBe(false);
  });

  test("rejects a signature made with a different secret", () => {
    expect(verifyCutluySignature({ header: `t=${T},v1=${SIG}`, rawBody: BODY, secret: "whsec_other", now: AT })).toBe(false);
  });

  test("rejects a genuine signature older than 5 minutes (a replay)", () => {
    const sixMinutesLater = new Date(T * 1000 + 6 * 60_000);
    expect(verifyCutluySignature({ header: `t=${T},v1=${SIG}`, rawBody: BODY, secret: SECRET, now: sixMinutesLater })).toBe(false);
  });

  test("rejects a timestamp more than 5 minutes in the future", () => {
    const sixMinutesEarlier = new Date(T * 1000 - 6 * 60_000);
    expect(verifyCutluySignature({ header: `t=${T},v1=${SIG}`, rawBody: BODY, secret: SECRET, now: sixMinutesEarlier })).toBe(false);
  });

  test("rejects missing or malformed headers", () => {
    for (const header of [null, "", "garbage", `t=${T}`, `v1=${SIG}`, `t=abc,v1=${SIG}`, `t=${T},v1=zz`]) {
      expect(verifyCutluySignature({ header, rawBody: BODY, secret: SECRET, now: AT })).toBe(false);
    }
  });
});
