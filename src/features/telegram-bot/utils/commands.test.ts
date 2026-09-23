import { describe, expect, test } from "bun:test";
import { parseCommand, parseLinkCode } from "./commands";

describe("parseLinkCode", () => {
  test("accepts a code typed in lowercase or with spaces around it", () => {
    expect(parseLinkCode("  k7pq2xrm ")).toBe("K7PQ2XRM");
  });

  test("rejects anything that can't be a Link code", () => {
    expect(parseLinkCode("")).toBeNull();
    expect(parseLinkCode("K7PQ")).toBeNull();
    expect(parseLinkCode("K7PQ2XRM please")).toBeNull();
    expect(parseLinkCode("'; drop table--")).toBeNull();
  });
});

describe("parseCommand", () => {
  test("/link with a Link code", () => {
    expect(parseCommand("/link K7PQ2XRM", "askherout_bot")).toEqual({ command: "link", arg: "K7PQ2XRM" });
  });

  test("/start with nothing after it", () => {
    expect(parseCommand("/start", "askherout_bot")).toEqual({ command: "start", arg: "" });
  });

  test("in groups, a command addressed to this bot counts and one for another bot doesn't", () => {
    expect(parseCommand("/link@AskHerOut_bot K7PQ2XRM", "askherout_bot")).toEqual({ command: "link", arg: "K7PQ2XRM" });
    expect(parseCommand("/link@some_other_bot K7PQ2XRM", "askherout_bot")).toBeNull();
  });

  test("ordinary chat messages are not commands", () => {
    expect(parseCommand("see you at 7!", "askherout_bot")).toBeNull();
    expect(parseCommand("", "askherout_bot")).toBeNull();
  });
});
