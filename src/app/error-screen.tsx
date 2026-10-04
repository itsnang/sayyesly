"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/analytics/track";

/** What a visitor sees when a page breaks. Shows no error text: it can quote their own words. */
export function ErrorScreen({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    reportError(error, { digest: error.digest });
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-4 text-center text-ink">
      <h1 className="font-hand text-4xl">oops, that didn&apos;t work</h1>
      <p className="max-w-xs text-muted">Something went wrong on our side. Give it another go.</p>
      <button type="button" onClick={retry} className="rounded-full bg-rose px-6 py-3 font-medium text-white">
        Try again
      </button>
      {error.digest ? <p className="text-xs text-faint">ref {error.digest}</p> : null}
    </main>
  );
}
