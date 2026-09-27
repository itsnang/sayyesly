# TanStack Query for every call the browser makes; pages stay server-rendered

Every page reads its data on the server (React Server Components) and passes it down as props. Beyond that first render, the browser talks to our server in a handful of ways:
- changing data through Server Actions (save, duplicate, delete, buy, answer);
- uploading photos;
- waiting for a Purchase to be paid;
- re-reading the Share drawer when the Creator comes back from Telegram.

Each of those had hand-rolled its own busy/error state, and several got the failure path wrong. A thrown action left dialogs stuck. The purchase poll swallowed errors, overlapped and ran in hidden tabs. Uploads carried on after their field left the page.

All of those calls go through TanStack Query:
- `useMutation` for changes and uploads;
- `useQuery` with `refetchInterval` for the purchase poll;
- `useQuery` with `refetchOnWindowFocus` for the Share drawer, seeded with the page's data (`initialData`).

What we don't do is fetch whole pages from the browser. Page data is still server-rendered. That keeps first paint fast and invite link previews working, and avoids a read endpoint per page. After a mutation, pages refresh the server way (`router.refresh()`, navigation, `revalidatePath` in the action).

## Consequences

- The `QueryClientProvider` wraps the whole app (root layout), so the Recipient's invite page loads TanStack Query too, for their Answer.
- Server Actions keep returning `{ error?: string }`. `runAction` in `src/lib/query/action.ts` is the single adapter that turns that, or a request that never came back, into a thrown `ActionError`.
- Each slice keeps its hooks in `features/<slice>/hooks/`: `useThemePurchase`, `useSaveInvite`, `useDuplicateInvite`, `useDeleteInvite`, `useImageUpload`, `useInviteAnswer`, `useShareState`.
- A new client call to our server goes through one of these hooks, not a bare `await action()` in a component.
- Moving a page's reads to the browser (fetching the dashboard list client-side, say) would be a new decision, not a follow-on from this one.
