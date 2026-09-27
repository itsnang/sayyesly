"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * TanStack Query for every call the browser makes to our server (see
 * docs/adr/0002): mutations, uploads, the Recipient's Answer, polling and
 * refetch-on-focus. Pages still arrive server-rendered; their data seeds queries.
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
