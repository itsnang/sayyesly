"use client";

import { ErrorScreen, type ErrorBoundaryProps } from "./error-screen";
import "./globals.css";

// Replaces the root layout when it breaks, so it brings its own <html>. No fonts here: the layout loads them.
export default function GlobalError(props: ErrorBoundaryProps) {
  return (
    <html lang="en">
      <body>
        <ErrorScreen {...props} />
      </body>
    </html>
  );
}
