import type { Instrumentation } from "next";

// Errors Next.js catches itself (a Server Component render, a Route Handler,
// a Server Action that threw) land here. See docs/adr/0005.
export const onRequestError: Instrumentation.onRequestError = async (error, _request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { logger } = await import("@/lib/logger");
  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : undefined;
  await logger.error("request.failed", error, { routePath: context.routePath, routeType: context.routeType, digest });
};
