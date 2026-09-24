"use client";

import { useRef, useState } from "react";
import type { AnswerInput, PublicAnswer } from "../../types";
import type { InviteThemeProps } from "../types";

export type PlanChoice = Extract<AnswerInput, { answer: "yes" }>["choice"];

/**
 * The Recipient's path through an Invite (ask, then plan, then answered), whatever
 * the Theme looks like. `sayMaybeLater` and `confirm` resolve to true once the
 * Answer is saved, so the Theme can celebrate or scroll afterwards.
 */
export function useInviteAnswer({ invite, submitAnswer }: InviteThemeProps) {
  const [answer, setAnswer] = useState<PublicAnswer | null>(invite.answer);
  const [stage, setStage] = useState<"ask" | "plan">("ask");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dodges = useRef(0);
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
    stage,
    busy,
    error,
    recordDodges: (count: number) => {
      dodges.current = count;
    },
    sayYes: () => setStage("plan"),
    sayMaybeLater: () => send({ answer: "maybe_later", note: null, noDodges: dodges.current }),
    confirm: (choice: PlanChoice, note: string) =>
      send({ answer: "yes", choice, note: note.trim() || null, noDodges: dodges.current }),
  };
}
