"use client";

import { useState } from "react";
import type { InviteThemeProps } from "../types";
import { useInviteAnswer } from "../../hooks/use-invite-answer";
import { BackgroundSong } from "../shared/background-song";
import { useFirstTap } from "../shared/use-first-tap";
import { usePlanSelection } from "../shared/use-plan-selection";
import { Answered } from "./answered";
import { Chapter, CHAPTER_PAGE, Contents, HardCover } from "./chapter";
import { markerFont, ransomFont } from "./fonts";
import { Pad, type PadPage } from "./pad";
import { COLORS } from "./palette";
import { BOARD_BG, SheetKind } from "./pieces";
import { QuestionPage } from "./question-page";

/**
 * Binder: a scrapbook journal on a spiral that shows the whole Plan up front.
 * Inside the cover the plan is a guest check listing the Stops, each Stop is a
 * collaged page, and the question is the last page. Pages turn by swiping
 * right to left. Maybe later is there from the start,
 * and the Song plays from the first touch.
 */
export function BinderInvite(props: InviteThemeProps) {
  const { invite } = props;
  const answering = useInviteAnswer(props);
  // The last page's picks live here, not in the page: it's drawn twice while it moves.
  const selection = usePlanSelection(invite);
  const [note, setNote] = useState("");
  const [justAnswered, setJustAnswered] = useState(false);
  const { stops } = invite.plan;
  // The Song starts on the Recipient's first touch, like Kitten Soft's; an Invite answered before this visit stays quiet.
  const song = invite.answer ? null : invite.song;
  const tapped = useFirstTap(!!song);

  // The cover, the contents, a page per Stop, and the question.
  const pages: PadPage[] = [{ kind: SheetKind.Board }, ...Array.from({ length: stops.length + 2 }, () => ({ kind: SheetKind.Paper }))];

  const render = (index: number, goTo: (page: number) => void) => {
    if (index === 0) return <HardCover plan={invite.plan} recipientName={invite.recipientName} />;
    if (index === 1) return <Contents plan={invite.plan} goTo={goTo} />;
    const stop = stops[index - CHAPTER_PAGE];
    if (stop) return <Chapter stop={stop} n={index - CHAPTER_PAGE + 1} />;
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
      className={`${markerFont.variable} ${ransomFont.variable}`}
      style={{
        minHeight: "100svh",
        width: "100%",
        background: BOARD_BG,
        color: COLORS.ink,
        display: "grid",
        placeItems: "center",
        padding: "44px 16px 28px",
        overflowX: "clip",
      }}
    >
      {answering.answer ? (
        <Answered answer={answering.answer} plan={invite.plan} timezone={invite.timezone} justAnswered={justAnswered} />
      ) : (
        <Pad pages={pages} render={render} />
      )}
      {song && <BackgroundSong song={song} playing={tapped} />}
    </div>
  );
}
