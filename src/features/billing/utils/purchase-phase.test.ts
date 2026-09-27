import { describe, expect, test } from "bun:test";
import { isPurchaseSettled, waitingPhase } from "./purchase-phase";

describe("isPurchaseSettled (stop polling)", () => {
  test("stops once the webhook has decided or the payment expired", () => {
    expect(isPurchaseSettled("paid")).toBe(true);
    expect(isPurchaseSettled("failed")).toBe(true);
    expect(isPurchaseSettled("expired")).toBe(true);
  });

  test("keeps polling while pending or before the first answer", () => {
    expect(isPurchaseSettled("pending")).toBe(false);
    expect(isPurchaseSettled(undefined)).toBe(false);
  });
});

describe("waitingPhase", () => {
  test("follows the status our database reports", () => {
    expect(waitingPhase("pending", false)).toBe("waiting");
    expect(waitingPhase("paid", false)).toBe("paid");
    expect(waitingPhase("failed", false)).toBe("failed");
    expect(waitingPhase("expired", false)).toBe("lapsed");
  });

  test("a QR past its expiry is lapsed even before the webhook says so", () => {
    expect(waitingPhase("pending", true)).toBe("lapsed");
    expect(waitingPhase(undefined, true)).toBe("lapsed");
  });

  test("paid wins over an expired countdown (they paid in the last second)", () => {
    expect(waitingPhase("paid", true)).toBe("paid");
  });
});
