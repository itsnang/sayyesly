"use client";

import { useRef, useState } from "react";
import type { InviteThemeProps } from "../types";
import { useInviteAnswer } from "../../hooks/use-invite-answer";
import { AskScreen } from "./ask-screen";
import { DoneScreen } from "./done-screen";
import { MaybeLaterScreen } from "./maybe-later-screen";
import { PlanScreen } from "./plan-screen";
import { useRain } from "./shared";

// The pink grid paper. It used to be painted by the global body, which put it behind
// every page while loading; the Theme now owns it.
const PAPER_BACKGROUND =
  "linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 26px 26px, " +
  "linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 26px 26px, " +
  "radial-gradient(130% 110% at 15% 0%, #fff0f6 0%, transparent 55%), " +
  "radial-gradient(130% 110% at 90% 100%, #ffe2ee 0%, transparent 55%), " +
  "var(--paper)";

export function KittenSoftInvite(props: InviteThemeProps) {
  const { invite } = props;
  const answering = useInviteAnswer(props);
  const [stage, setStage] = useState<"ask" | "plan">("ask");
  const dodges = useRef(0);
  const { celebrate, layer } = useRain();

  let screen;
  if (answering.answer?.answer === "yes") {
    screen = <DoneScreen answer={answering.answer} plan={invite.plan} timezone={invite.timezone} />;
  } else if (answering.answer?.answer === "maybe_later") {
    screen = <MaybeLaterScreen />;
  } else if (stage === "ask") {
    screen = (
      <AskScreen
        question={invite.question}
        message={invite.message}
        imageUrl={invite.imageUrl}
        busy={answering.busy}
        error={answering.error}
        onDodge={(n) => (dodges.current = n)}
        onYes={() => {
          celebrate(1300);
          setStage("plan");
          window.scrollTo(0, 0);
        }}
        onMaybeLater={async () => {
          if (await answering.sayMaybeLater(dodges.current)) window.scrollTo(0, 0);
        }}
      />
    );
  } else {
    screen = (
      <PlanScreen
        invite={invite}
        busy={answering.busy}
        error={answering.error}
        onConfirm={async (choice, note) => {
          if (await answering.sayYes(choice, note, dodges.current)) {
            celebrate(5400);
            window.scrollTo(0, 0);
          }
        }}
      />
    );
  }

  return (
    <div style={{ background: PAPER_BACKGROUND, minHeight: "100vh", width: "100%", flexShrink: 0 }}>
      {layer}
      {screen}
    </div>
  );
}
