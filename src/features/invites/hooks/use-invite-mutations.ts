import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { runAction } from "@/lib/query/action";
import { deleteInvite, duplicateInvite, reopenInvite, saveInvite } from "../actions";
import type { InviteFormValues } from "../schemas";

// The Creator's changes to their Invites, as mutations. Each one calls its
// Server Action through `runAction`, so a failure (the action's `{ error }` or
// a request that never came back) always lands in `error` and never leaves the
// caller stuck pending. Reads stay server-rendered: after a change we navigate
// or `router.refresh()`, and the actions revalidate the pages.

/** Copies an Invite into a new one, then opens the copy's Share step. Treat `isSuccess` as still busy: the page is changing. */
export function useDuplicateInvite() {
  const router = useRouter();
  return useMutation({
    mutationFn: (inviteId: string) => runAction(() => duplicateInvite(inviteId)),
    onSuccess: (result) => router.push(`/dashboard/invites/${result.id}?created=1${result.themeSwapped ? "&themeSwapped=1" : ""}`),
  });
}

/** Deletes an Invite for good, then goes back to the list. Treat `isSuccess` as still busy: the page is changing. */
export function useDeleteInvite() {
  const router = useRouter();
  return useMutation({
    mutationFn: (inviteId: string) => runAction(() => deleteInvite(inviteId)),
    onSuccess: () => router.push("/dashboard"),
  });
}

/** Clears the Invite's Answer so the Recipient can answer again, then reloads the studio (now unlocked). */
export function useReopenInvite() {
  const router = useRouter();
  return useMutation({
    mutationFn: (inviteId: string) => runAction(() => reopenInvite(inviteId)),
    onSuccess: () => router.refresh(),
  });
}

/**
 * Creates (`inviteId` null) or updates an Invite. The result's `answered` is
 * true when the Invite has an Answer, in which case only the Plan and the
 * wording around it were saved; the editor may not have known yet.
 */
export function useSaveInvite(inviteId: string | null) {
  return useMutation({
    mutationFn: (values: InviteFormValues) => runAction(() => saveInvite(inviteId, values)),
  });
}
