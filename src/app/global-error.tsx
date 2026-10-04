"use client";

import { ErrorScreen } from "./error-screen";
import "./globals.css";

// Replaces the root layout when it breaks, so it brings its own <html>. No fonts here: the layout loads them.
export default function GlobalError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <ErrorScreen error={error} retry={unstable_retry} />
      </body>
    </html>
  );
}
