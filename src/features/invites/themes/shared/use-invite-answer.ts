"use client";

import { useRef, useState } from "react";
import type { AnswerInput, PublicAnswer } from "../../types";
import type { InviteThemeProps } from "../types";

export type PlanChoice = Extract<AnswerInput, { answer: "yes" }>["choice"];

/**
 * Saving the Recipient's Answer, whatever the Theme looks like. `sayYes` and
 * `sayMaybeLater` resolve to true once it's saved. Themes without a runaway
 * "No" leave `noDodges` at 0.
 */
export function useInviteAnswer({ invite, submitAnswer }: InviteThemeProps) {
  const [answer, setAnswer] = useState<PublicAnswer | null>(invite.answer);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);

  async function send(input: AnswerInput): Promise<boolean> {
    // A ref, not state: two taps in the same frame both see stale `busy` state.
    if (sending.current) return false;
    sending.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await submitAnswer(input);
      if (result.answer) {
        setAnswer(result.answer);
        return true;
      }
      setError(result.error ?? "Something went wrong. Please try again.");
      return false;
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      return false;
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return {
    answer,
    busy,
    error,
    sayYes: (choice: PlanChoice, note: string, noDodges = 0) =>
      send({ answer: "yes", choice, note: note.trim() || null, noDodges }),
    sayMaybeLater: (noDodges = 0) => send({ answer: "maybe_later", note: null, noDodges }),
  };
}
