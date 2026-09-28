# Zustand for shared screen state only; server data stays in TanStack Query, forms in React Hook Form

State in the browser comes in three kinds, and each has one home:

- **Data from our server** (invites, purchases, the share state, an Answer being saved) lives in **TanStack Query** (ADR 0002). It knows about loading, errors, retries and refetching, which a plain store doesn't.
- **A form being edited** (the studio's fields) lives in **React Hook Form**, which owns validation, dirty tracking and field errors.
- **Screen state that several components share** lives in **Zustand**: which studio sections are open, the preview device, the preview and Share drawers, and the Paid theme being unlocked. Before this, the studio held it in a pile of `useState`s and passed the checkout down as an `onUnlockTheme` callback from the page to the editor to the Theme picker.

State used by one component stays in that component's `useState`.

## How

- One store per mounted tree, created in a provider (`StudioStoreProvider` in `features/invites/stores/`), not a module-level store. On the server a module-level store would be shared by every visitor's render, and each Invite opened should start fresh.
- Only what's worth keeping between visits is persisted (the studio's preview device), with `skipHydration` and a rehydrate after mount, so the server's HTML and the first client render agree.
- Components read with a selector per value (`useStudio((s) => s.device)`), so they re-render only for what they use.

## Consequences

- Putting server data or form values into a Zustand store would be a new decision, not a follow-on from this one: it would duplicate TanStack Query's cache or React Hook Form's state and drift from it.
- A slice that needs shared screen state keeps its store in `features/<slice>/stores/`, with its own provider.
