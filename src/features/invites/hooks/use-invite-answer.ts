import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/track";
import { AnswerKind } from "@/lib/enums";
import { ActionError, errorMessage, runAction } from "@/lib/query/action";
import { isInviteAnswered } from "../actions";
import type { InviteThemeProps } from "../themes/types";
import type { AnswerInput } from "../types";

export type PlanChoice = Extract<AnswerInput, { answer: typeof AnswerKind.Yes }>["choice"];

/**
 * Saving the Recipient's Answer, whatever the Theme looks like, as a mutation.
 * `sayYes` and `sayMaybeLater` resolve to true once it's saved. The server
 * keeps one Answer per Invite and returns the one on record to a repeat
 * submit. Themes without a runaway "No" leave `noDodges` at 0.
 *
 * While a real (saved) Answer is showing, the page re-checks it whenever it
 * comes back into view: if the Creator has Reopened the Invite, the page
 * reloads to its first screen instead of the answered one.
 */
export function useInviteAnswer({ invite, submitAnswer }: InviteThemeProps) {
  // A ref, not mutation state: two taps in the same frame both see it not pending yet.
  const sending = useRef(false);
  // A saved Answer is on show (from the server, or sent from this page). Previews never set it.
  const recorded = useRef(invite.answer !== null);
  const mutation = useMutation({
    mutationFn: async (input: AnswerInput) => {
      const result = await runAction(() => submitAnswer(input));
      if (!result.answer) throw new ActionError("Something went wrong. Please try again.");
      // Previews (the studio, /demo, a Creator opening their own Invite) save nothing, so they don't count.
      if (!result.preview) {
        recorded.current = true;
        track("invite_answered", { kind: result.answer.answer });
      }
      return result.answer;
    },
  });

  useEffect(() => {
    const recheck = async () => {
      if (document.hidden || !recorded.current) return;
      // A failed check changes nothing: keep showing the Answer.
      const answered = await isInviteAnswered(invite.slug).catch(() => true);
      if (!answered) window.location.reload();
    };
    // Also when the browser restores the page from its back/forward cache.
    const onPageShow = (e: PageTransitionEvent) => e.persisted && void recheck();
    document.addEventListener("visibilitychange", recheck);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", recheck);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [invite.slug]);

  async function send(input: AnswerInput): Promise<boolean> {
    if (sending.current) return false;
    sending.current = true;
    try {
      await mutation.mutateAsync(input);
      return true;
    } catch {
      return false; // shown through `error`
    } finally {
      sending.current = false;
    }
  }

  return {
    answer: mutation.data ?? invite.answer,
    busy: mutation.isPending,
    error: errorMessage(mutation.error),
    sayYes: (choice: PlanChoice, note: string, noDodges = 0) =>
      send({ answer: AnswerKind.Yes, choice, note: note.trim() || null, noDodges }),
    sayMaybeLater: (noDodges = 0) => send({ answer: AnswerKind.MaybeLater, note: null, noDodges }),
  };
}
