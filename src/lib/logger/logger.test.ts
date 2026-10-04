import { describe, expect, test } from "bun:test";
import { createLogger } from "./logger";

function setup(dedupeMs = 60_000) {
  let time = 0;
  const lines: { level: string; line: string }[] = [];
  const reports: { error: unknown; props: object }[] = [];
  const logger = createLogger({
    write: (level, line) => lines.push({ level, line }),
    report: (error, props) => reports.push({ error, props }),
    now: () => time,
    dedupeMs,
  });
  return { logger, lines, reports, advance: (ms: number) => (time += ms) };
}

describe("logger", () => {
  test("writes one structured JSON line per call", () => {
    const { logger, lines } = setup();
    logger.info("notify.sent", { chatId: 5 });
    logger.warn("cutluy.mismatch", { purchaseId: "p1" });
    expect(lines.map((l) => l.level)).toEqual(["info", "warn"]);
    expect(JSON.parse(lines[0]!.line)).toEqual({ level: "info", event: "notify.sent", chatId: 5 });
  });

  test("only error reports to analytics, with the event name and context", () => {
    const { logger, reports } = setup();
    logger.info("a");
    logger.warn("b");
    expect(reports).toHaveLength(0);
    const error = new Error("boom");
    logger.error("telegram.update_failed", error, { updateId: 9 });
    expect(reports).toEqual([{ error, props: { event: "telegram.update_failed", updateId: 9 } }]);
  });

  test("error still writes the line, with the error's name but not its message", () => {
    const { logger, lines } = setup();
    logger.error("x.failed", new TypeError("secret"), { id: "1" });
    const parsed = JSON.parse(lines[0]!.line);
    expect(parsed).toMatchObject({ level: "error", event: "x.failed", errorName: "TypeError", id: "1" });
  });

  test("the same error from the same place reports once a minute", () => {
    const { logger, reports, lines, advance } = setup();
    const fail = () => logger.error("db.failed", new Error("down"));
    fail();
    fail();
    expect(reports).toHaveLength(1);
    expect(lines).toHaveLength(2); // logging is never deduped
    advance(60_001);
    fail();
    expect(reports).toHaveLength(2);
  });

  test("different events or different errors are not deduped together", () => {
    const { logger, reports } = setup();
    logger.error("a", new Error("x"));
    logger.error("b", new Error("x"));
    logger.error("a", new RangeError("x"));
    expect(reports).toHaveLength(3);
  });

  test("a thrown non-Error is reported too", () => {
    const { logger, reports } = setup();
    logger.error("a", "just a string");
    expect(reports).toHaveLength(1);
  });

  test("a failing reporter never breaks the caller", () => {
    const logger = createLogger({
      write: () => {},
      report: () => {
        throw new Error("posthog down");
      },
    });
    expect(() => logger.error("a", new Error("x"))).not.toThrow();
  });
});
