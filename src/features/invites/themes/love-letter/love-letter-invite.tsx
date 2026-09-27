"use client";

import { useState, type CSSProperties } from "react";
import type { InviteThemeProps } from "../types";
import { useInviteAnswer } from "../shared/use-invite-answer";
import { MaybeLaterScreen, YesScreen } from "./answered-screens";
import { Envelope } from "./envelope";
import { markerFont, penFont, printFont } from "./fonts";
import { LetterScreen } from "./letter-screen";
import { PaperFilters } from "./ornaments";
import { CSS_VARIABLES } from "./palette";

/**
 * Love Letter: an invitation rather than a question. A handmade envelope opens
 * onto the letter; the Recipient picks a time and says Yes, or says they can't
 * make it (a Maybe later). There is no runaway "No".
 */
export function LoveLetterInvite(props: InviteThemeProps) {
  const { invite } = props;
  const answering = useInviteAnswer(props);
  const [reading, setReading] = useState(false);
  const [justAnswered, setJustAnswered] = useState(false);

  let screen;
  if (answering.answer?.answer === "yes") {
    screen = <YesScreen answer={answering.answer} plan={invite.plan} timezone={invite.timezone} justAnswered={justAnswered} />;
  } else if (answering.answer?.answer === "maybe_later") {
    screen = <MaybeLaterScreen justAnswered={justAnswered} />;
  } else if (!reading) {
    screen = <Envelope invite={invite} onRead={() => setReading(true)} />;
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
        onMaybeLater={async () => {
          if (await answering.sayMaybeLater()) {
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
      style={{ ...(CSS_VARIABLES as CSSProperties), minHeight: "100vh", width: "100%", flexShrink: 0, overflowX: "clip", color: "var(--ll-ink)" }}
    >
      <PaperFilters />
      {screen}
      <style>{`
        .ll-split { display: grid; gap: 30px; align-items: start; }
        @media (min-width: 620px) { .ll-split { grid-template-columns: 1.1fr 1fr; } }
        @keyframes ll-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .ll-dialog {
          width: min(380px, calc(100% - 40px)); max-width: none; margin: auto; padding: 0; border: none;
          background: var(--ll-diary); color: var(--ll-ink);
          box-shadow: 0 24px 60px -24px rgba(38,55,196,.45);
          rotate: -.8deg;
        }
        .ll-dialog[open] { animation: ll-rise .25s ease-out both; }
        .ll-dialog::backdrop { background: rgba(38,55,196,.16); backdrop-filter: blur(2px); }
        @keyframes ll-draw { to { stroke-dashoffset: 0; } }
        @keyframes ll-fly {
          0%   { transform: translate(-120px, 80vh) rotate(8deg); opacity: 1; }
          60%  { transform: translate(55vw, 35vh) rotate(-14deg); opacity: 1; }
          100% { transform: translate(110vw, -20vh) rotate(-24deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
