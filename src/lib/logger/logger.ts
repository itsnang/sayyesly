/**
 * Structured logging that also reports errors to analytics (docs/adr/0005).
 *
 * Every call writes one JSON line to stdout (Vercel collects it). Only `error`
 * is reported to PostHog, once a minute per kind of failure per instance, so a
 * bad deploy or a script can't flood it. Context is ids and enums only; the
 * error's message is never written or sent (it can quote a Creator's text).
 */

export type LogLevel = "info" | "warn" | "error";
export type LogContext = Record<string, string | number | boolean | null | undefined>;

type LoggerOptions = {
  write: (level: LogLevel, line: string) => void;
  report: (error: unknown, props: LogContext) => void | Promise<void>;
  now?: () => number;
  dedupeMs?: number;
};

const MAX_REMEMBERED = 200;

/** Where an error came from: its kind plus the first stack frame. */
function fingerprint(event: string, error: unknown): string {
  if (!(error instanceof Error)) return `${event}:${typeof error}`;
  const frame = error.stack?.split("\n").find((line) => line.trimStart().startsWith("at ")) ?? "";
  return `${event}:${error.name}:${frame.trim()}`;
}

export function createLogger({ write, report, now = Date.now, dedupeMs = 60_000 }: LoggerOptions) {
  const lastReported = new Map<string, number>();

  function shouldReport(key: string): boolean {
    const at = now();
    const last = lastReported.get(key);
    if (last !== undefined && at - last < dedupeMs) return false;
    if (lastReported.size >= MAX_REMEMBERED) lastReported.clear();
    lastReported.set(key, at);
    return true;
  }

  const line = (level: LogLevel, event: string, context: LogContext) => write(level, JSON.stringify({ level, event, ...context }));

  return {
    info: (event: string, context: LogContext = {}) => line("info", event, context),
    warn: (event: string, context: LogContext = {}) => line("warn", event, context),
    /**
     * An unexpected failure: logged, and reported to analytics. Expected `{ error }` results don't belong here.
     * Resolves once the report is out; callers outside a request (`onRequestError`) await it.
     */
    async error(event: string, error: unknown, context: LogContext = {}): Promise<void> {
      line("error", event, { ...(error instanceof Error ? { errorName: error.name } : {}), ...context });
      if (!shouldReport(fingerprint(event, error))) return;
      try {
        await report(error, { event, ...context });
      } catch {
        // Reporting must never break the code that hit the error.
      }
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
