"use client";

import { ErrorScreen, type ErrorBoundaryProps } from "./error-screen";

export default function Error(props: ErrorBoundaryProps) {
  return <ErrorScreen {...props} />;
}
