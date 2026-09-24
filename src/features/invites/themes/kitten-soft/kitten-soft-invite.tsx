"use client";

import type { InviteThemeProps } from "../types";
import { useInviteAnswer } from "../shared/use-invite-answer";
import { AskScreen } from "./ask-screen";
import { DoneScreen } from "./done-screen";
import { MaybeLaterScreen } from "./maybe-later-screen";
import { PlanScreen } from "./plan-screen";
import { useRain } from "./shared";

export function KittenSoftInvite(props: InviteThemeProps) {
  const { invite } = props;
  const flow = useInviteAnswer(props);
  const { celebrate, layer } = useRain();

  let screen;
  if (flow.answer?.answer === "yes") {
    screen = <DoneScreen answer={flow.answer} plan={invite.plan} timezone={invite.timezone} />;
  } else if (flow.answer?.answer === "maybe_later") {
    screen = <MaybeLaterScreen />;
  } else if (flow.stage === "ask") {
    screen = (
      <AskScreen
        question={invite.question}
        message={invite.message}
        imageUrl={invite.imageUrl}
        busy={flow.busy}
        error={flow.error}
        onDodge={flow.recordDodges}
        onYes={() => {
          celebrate(1300);
          flow.sayYes();
          window.scrollTo(0, 0);
        }}
        onMaybeLater={async () => {
          if (await flow.sayMaybeLater()) window.scrollTo(0, 0);
        }}
      />
    );
  } else {
    screen = (
      <PlanScreen
        invite={invite}
        busy={flow.busy}
        error={flow.error}
        onConfirm={async (choice, note) => {
          if (await flow.confirm(choice, note)) {
            celebrate(5400);
            window.scrollTo(0, 0);
          }
        }}
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
