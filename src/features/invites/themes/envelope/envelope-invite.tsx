"use client";

import { useState, type CSSProperties } from "react";
import { AnswerKind } from "@/lib/enums";
import type { InviteThemeProps } from "../types";
import { useInviteAnswer } from "../../hooks/use-invite-answer";
import { MaybeLaterScreen, YesScreen } from "./answered-screens";
import { SealedEnvelope } from "./sealed-envelope";
import { markerFont, penFont, printFont } from "./fonts";
import { LetterScreen } from "./letter-screen";
import { PaperFilters } from "./ornaments";
import { CSS_VARIABLES } from "./palette";
import { BackgroundSong } from "../shared/background-song";

/**
 * Envelope: an invitation rather than a question. A handmade envelope opens
 * onto the letter, and the Recipient answers by picking a time and saying Yes.
 * It offers no way to decline. An Invite answered Maybe later before that
 * (or under another Theme) still shows its Maybe later screen.
 */
export function EnvelopeInvite(props: InviteThemeProps) {
  const { invite } = props;
  const answering = useInviteAnswer(props);
  const [reading, setReading] = useState(false);
  // The Song plays in the background from the "tap to open" tap on, through the letter and the answer.
  const [opened, setOpened] = useState(false);
  // Only while there's an envelope left to open: an Invite answered before this visit stays quiet.
  const song = invite.answer ? null : invite.song;
  const [justAnswered, setJustAnswered] = useState(false);

  let screen;
  if (answering.answer?.answer === AnswerKind.Yes) {
    screen = <YesScreen answer={answering.answer} plan={invite.plan} timezone={invite.timezone} justAnswered={justAnswered} />;
  } else if (answering.answer?.answer === AnswerKind.MaybeLater) {
    screen = <MaybeLaterScreen justAnswered={justAnswered} />;
  } else if (!reading) {
    screen = <SealedEnvelope invite={invite} onOpen={() => setOpened(true)} onRead={() => setReading(true)} />;
  } else {
    screen = (
      <LetterScreen
        invite={invite}
        busy={answering.busy}
        error={answering.error}
        onYes={async (choice, note) => {
          if (await answering.sayYes(choice, note)) {
            setJustAnswered(true);
            window.scrollTo(0, 0);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`${markerFont.variable} ${penFont.variable} ${printFont.variable}`}
      style={{
        ...(CSS_VARIABLES as CSSProperties),
        minHeight: "100vh",
        width: "100%",
        flexShrink: 0,
        overflowX: "clip",
        color: "var(--env-ink)",
      }}
    >
      <PaperFilters />
      {screen}
      {song && <BackgroundSong song={song} playing={opened} />}
      <style>{`
        .env-split { display: grid; gap: 30px; align-items: start; }
        @media (min-width: 620px) { .env-split { grid-template-columns: 1.1fr 1fr; } }
        @keyframes env-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes env-draw { to { stroke-dashoffset: 0; } }
        @keyframes env-fly {
          0%   { transform: translate(-120px, 80vh) rotate(8deg); opacity: 1; }
          60%  { transform: translate(55vw, 35vh) rotate(-14deg); opacity: 1; }
          100% { transform: translate(110vw, -20vh) rotate(-24deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
