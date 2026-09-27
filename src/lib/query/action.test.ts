import { describe, expect, test } from "bun:test";
import { ActionError, errorMessage, runAction } from "./action";

describe("runAction", () => {
  test("passes a successful result through", async () => {
    await expect(runAction(async (): Promise<{ error?: string; id?: string }> => ({ id: "abc" }))).resolves.toEqual({ id: "abc" });
  });

  test("throws the action's own error message, marked as not a network failure", async () => {
    const failed = runAction(async (): Promise<{ error?: string }> => ({ error: "Invite not found." }));
    await expect(failed).rejects.toBeInstanceOf(ActionError);
    await expect(failed).rejects.toMatchObject({ message: "Invite not found.", network: false });
  });

  test("turns a call that throws (the request never came back) into a network error", async () => {
    const failed = runAction(async (): Promise<{ error?: string }> => {
      throw new TypeError("Failed to fetch");
    });
    await expect(failed).rejects.toMatchObject({ network: true, message: "Couldn't reach the server. Check your connection and try again." });
  });
});

describe("errorMessage", () => {
  test("reads an ActionError's message and ignores anything else", () => {
    expect(errorMessage(new ActionError("Too many tries."))).toBe("Too many tries.");
    expect(errorMessage(new Error("internal detail"))).toBe("Something went wrong. Please try again.");
    expect(errorMessage(null)).toBeNull();
  });
});
