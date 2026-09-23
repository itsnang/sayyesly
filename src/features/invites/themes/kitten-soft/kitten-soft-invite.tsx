"use client";

import { useState } from "react";
import type { InviteThemeProps } from "../types";
import { AskScreen } from "./ask-screen";
import { PlanScreen } from "./plan-screen";

export function KittenSoftInvite({ invite, submitAnswer }: InviteThemeProps) {
  const [stage, setStage] = useState<"ask" | "plan">("ask");

  if (stage === "ask") {
    return (
      <AskScreen
        question={invite.question}
        message={invite.message}
        imageUrl={invite.imageUrl}
        onYes={() => {
          setStage("plan");
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  return <PlanScreen invite={invite} submitAnswer={submitAnswer} />;
}
