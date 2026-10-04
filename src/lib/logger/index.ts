import "server-only";
import { after } from "next/server";
import { reportServerException } from "@/lib/analytics/server";
import { createLogger } from "./logger";

/** The server's logger. Use it instead of `console.*` (docs/adr/0005). */
export const logger = createLogger({
  write: (level, line) => {
    // The one place that talks to the console.
    // eslint-disable-next-line no-console
    console[level](line);
  },
  report: (error, props) => {
    const sent = reportServerException(error, props);
    // Keep the function alive until the event is out. Outside a request there's no `after`;
    // the caller can await the returned promise instead.
    try {
      after(sent);
    } catch {
      // not in a request
    }
    return sent;
  },
});
