"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * TanStack Query for the dashboard only (see docs/adr/0002): mutation state and
 * polling. Page data stays server-rendered, so there's no read cache to tune.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // A mutation (save, buy, delete) is never repeated behind the Creator's back.
          mutations: { retry: false },
          queries: { retry: 2, refetchOnWindowFocus: false },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
