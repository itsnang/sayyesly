# TanStack Query for mutation state and polling only; page data stays server-rendered

Every page reads its data on the server (React Server Components) and passes it down as props. Client code only ever *changes* server data (Server Actions) or *waits* for it (the Theme purchase poll). Those client parts had each hand-rolled their own busy/error state, and several got the failure path wrong: a thrown action left dialogs stuck, and the purchase poll swallowed errors, overlapped and ran in hidden tabs.

We use TanStack Query for exactly those two jobs: `useMutation` around Server Actions, and `useQuery` with `refetchInterval` for polling. We don't use it to fetch or cache page data from the browser. After a mutation, pages refresh the server way (`router.refresh()`, navigation, `revalidatePath` in the action).

## Consequences

- The `QueryClientProvider` wraps `/dashboard` only. The landing page and the Recipient's invite pages don't load TanStack Query.
- Server Actions keep returning `{ error?: string }`. `runAction` in `src/lib/query/action.ts` is the single adapter that turns that, or a request that never came back, into a thrown `ActionError` for TanStack Query.
- Each slice keeps its client server-state modules in `features/<slice>/hooks/` (e.g. `useThemePurchase`, `useSaveInvite`).
- Moving a page's reads to client queries (e.g. the share panel's linked groups on window focus) would be a new decision, not a follow-on from this one.
