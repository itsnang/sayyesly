import { useQuery } from "@tanstack/react-query";
import { runAction } from "@/lib/query/action";
import { getShareState } from "../actions";
import type { ShareState } from "../types";

/**
 * Where this Invite's Answer will be sent (the Creator's DM, its Linked
 * groups). Starts from what the page rendered, then re-reads when the tab
 * comes back into view: pressing Start on the bot or linking a group happens
 * in Telegram, and the drawer should reflect it on return without a reload.
 */
export function useShareState(inviteId: string, initial: ShareState): ShareState {
  const query = useQuery({
    queryKey: ["share-state", inviteId],
    queryFn: async (): Promise<ShareState> => {
      const { canDm, linkedGroups } = await runAction(() => getShareState(inviteId));
      return { canDm, linkedGroups };
    },
    initialData: initial,
    // The page's data is fresh when it arrives; after that, every return to the tab re-reads it.
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: "always",
  });
  return query.data;
}
