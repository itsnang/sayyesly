"use client";

import { useRef, useState } from "react";
import type { AnswerInput, PublicAnswer } from "../../types";
import type { InviteThemeProps } from "../types";
import { AskScreen } from "./ask-screen";
import { DoneScreen } from "./done-screen";
import { MaybeLaterScreen } from "./maybe-later-screen";
import { PlanScreen, type PlanChoice } from "./plan-screen";
import { useRain } from "./shared";

export function KittenSoftInvite({ invite, submitAnswer }: InviteThemeProps) {
  const [answer, setAnswer] = useState<PublicAnswer | null>(invite.answer);
  const [stage, setStage] = useState<"ask" | "plan">("ask");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dodges = useRef(0);
  const sending = useRef(false);
  const { celebrate, layer } = useRain();

  async function send(input: AnswerInput, onSaved: () => void) {
    // A ref, not state: two taps in the same frame both see stale `busy` state.
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await submitAnswer(input);
      if (result.answer) {
        setAnswer(result.answer);
        onSaved();
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  let screen;
  if (answer?.answer === "yes") {
    screen = <DoneScreen answer={answer} plan={invite.plan} timezone={invite.timezone} />;
  } else if (answer?.answer === "maybe_later") {
    screen = <MaybeLaterScreen />;
  } else if (stage === "ask") {
    screen = (
      <AskScreen
        question={invite.question}
        message={invite.message}
        imageUrl={invite.imageUrl}
        busy={busy}
        error={error}
        onDodge={(n) => (dodges.current = n)}
        onYes={() => {
          celebrate(1300);
          setStage("plan");
          window.scrollTo(0, 0);
        }}
        onMaybeLater={() =>
          send({ answer: "maybe_later", note: null, noDodges: dodges.current }, () => window.scrollTo(0, 0))
        }
      />
    );
  } else {
    screen = (
      <PlanScreen
        invite={invite}
        busy={busy}
        error={error}
        onConfirm={(choice: PlanChoice, note: string) =>
          send({ answer: "yes", choice, note: note.trim() || null, noDodges: dodges.current }, () => {
            celebrate(5400);
            window.scrollTo(0, 0);
          })
        }
      />
    );
  }

  return (
    <>
      {layer}
      {screen}
    </>
  );
}
