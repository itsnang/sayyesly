import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { track } from "@/lib/analytics/track";
import { ActionError, errorMessage, runAction } from "@/lib/query/action";
import type { InviteThemeProps } from "../themes/types";
import type { AnswerInput } from "../types";

export type PlanChoice = Extract<AnswerInput, { answer: "yes" }>["choice"];

/**
 * Saving the Recipient's Answer, whatever the Theme looks like, as a mutation.
 * `sayYes` and `sayMaybeLater` resolve to true once it's saved. The server
 * keeps one Answer per Invite and returns the one on record to a repeat
 * submit. Themes without a runaway "No" leave `noDodges` at 0.
 */
export function useInviteAnswer({ invite, submitAnswer }: InviteThemeProps) {
  // A ref, not mutation state: two taps in the same frame both see it not pending yet.
  const sending = useRef(false);
  const mutation = useMutation({
    mutationFn: async (input: AnswerInput) => {
      const result = await runAction(() => submitAnswer(input));
      if (!result.answer) throw new ActionError("Something went wrong. Please try again.");
      // Previews (the studio, /demo, a Creator opening their own Invite) save nothing, so they don't count.
      if (!result.preview) track("invite_answered", { kind: result.answer.answer });
      return result.answer;
    },
  });

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
      send({ answer: "yes", choice, note: note.trim() || null, noDodges }),
    sayMaybeLater: (noDodges = 0) => send({ answer: "maybe_later", note: null, noDodges }),
  };
}
