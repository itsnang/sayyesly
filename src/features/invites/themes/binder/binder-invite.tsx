"use client";

import { useState } from "react";
import type { InviteThemeProps } from "../types";
import { useInviteAnswer } from "../../hooks/use-invite-answer";
import { usePlanSelection } from "../shared/use-plan-selection";
import { Answered } from "./answered";
import { Chapter, Cover } from "./chapter";
import { markerFont } from "./fonts";
import { Pad } from "./pad";
import { BOARD_BG, COLORS } from "./pieces";
import { QuestionPage } from "./question-page";

/**
 * Binder: a scrapbook pad on top rings that shows the whole Plan up front. The
 * cover lists the Stops, each Stop is a page, and the question is the last
 * page. Pages turn by swiping right to left. Maybe later is there from the start.
 */
export function BinderInvite(props: InviteThemeProps) {
  const { invite } = props;
  const answering = useInviteAnswer(props);
  // The last page's picks live here, not in the page: it's drawn twice while it moves.
  const selection = usePlanSelection(invite);
  const [note, setNote] = useState("");
  const [justAnswered, setJustAnswered] = useState(false);
  const { stops } = invite.plan;

  const render = (index: number) => {
    if (index === 0) return <Cover plan={invite.plan} recipientName={invite.recipientName} />;
    const stop = stops[index - 1];
    if (stop) return <Chapter stop={stop} n={index} />;
    return (
      <QuestionPage
        invite={invite}
        selection={selection}
        note={note}
        onNote={setNote}
        busy={answering.busy}
        error={answering.error}
        onYes={async () => {
          if (selection.choice && (await answering.sayYes(selection.choice, note))) setJustAnswered(true);
        }}
        onMaybeLater={async () => {
          if (await answering.sayMaybeLater()) setJustAnswered(true);
        }}
      />
    );
  };

  return (
    <div
      className={markerFont.variable}
      style={{
        minHeight: "100svh",
        width: "100%",
        background: BOARD_BG,
        color: COLORS.ink,
        display: "grid",
        placeItems: "center",
        padding: "40px 16px 32px",
        overflowX: "clip",
      }}
    >
      {answering.answer ? (
        <Answered answer={answering.answer} plan={invite.plan} timezone={invite.timezone} justAnswered={justAnswered} />
      ) : (
        <Pad count={stops.length + 2} render={render} />
      )}
    </div>
  );
}
