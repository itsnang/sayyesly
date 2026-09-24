"use client";

import { useState, type CSSProperties } from "react";
import type { InviteThemeProps } from "../types";
import { useInviteAnswer } from "../shared/use-invite-answer";
import { AcceptedPage, NotThisTimePage } from "./answered-cards";
import { DiaryPage } from "./diary-page";
import { Envelope } from "./envelope";
import { marker, pen, print } from "./fonts";
import { PaperFilters } from "./ornaments";

const PALETTE = {
  "--ll-table": "#eeebe6",
  "--ll-diary": "#f8f6f0",
  "--ll-card": "#f3ecdf",
  "--ll-paper": "#efe7d8",
  "--ll-paper-deep": "#ddd0b9",
  "--ll-envelope": "#e5d8bf",
  "--ll-envelope-front": "#eadfc9",
  "--ll-envelope-flap": "#e1d3b8",
  "--ll-envelope-in": "#d3c3a4",
  "--ll-ink": "#2637c4",
  "--ll-graphite": "#8d8a83",
  "--ll-faint": "#c4c0b8",
  "--ll-rule": "rgba(38,55,196,.2)",
  "--ll-error": "#b8433a",
  "--ll-sun": "#f4c54a",
  "--ll-leaf": "#a3c27f",
  "--ll-leaf-ink": "#6f8f55",
  "--ll-petal": "#f3a9b9",
  "--ll-sky": "#b8d0f0",
} as CSSProperties;

/**
 * Love Letter: an invitation rather than a question. A handmade envelope opens
 * onto a page from a diary; the Recipient picks a time and sends their answer,
 * or says they can't make it (a Maybe later). There is no runaway "No".
 */
export function LoveLetterInvite(props: InviteThemeProps) {
  const { invite } = props;
  const flow = useInviteAnswer(props);
  const [reading, setReading] = useState(false);
  const [justSent, setJustSent] = useState(false);

  let screen;
  if (flow.answer?.answer === "yes") {
    screen = <AcceptedPage answer={flow.answer} plan={invite.plan} timezone={invite.timezone} justSent={justSent} />;
  } else if (flow.answer?.answer === "maybe_later") {
    screen = <NotThisTimePage />;
  } else if (!reading) {
    screen = <Envelope invite={invite} onRead={() => setReading(true)} />;
  } else {
    screen = (
      <DiaryPage
        invite={invite}
        busy={flow.busy}
        error={flow.error}
        onAccept={async (choice, note) => {
          if (await flow.confirm(choice, note)) {
            setJustSent(true);
            window.scrollTo(0, 0);
          }
        }}
        onNotThisTime={async () => {
          if (await flow.sayMaybeLater()) window.scrollTo(0, 0);
        }}
      />
    );
  }

  return (
    <div
      className={`${marker.variable} ${pen.variable} ${print.variable}`}
      style={{ ...PALETTE, minHeight: "100vh", width: "100%", flexShrink: 0, overflowX: "clip", color: "var(--ll-ink)" }}
    >
      <PaperFilters />
      {screen}
      <style>{`
        .ll-split { display: grid; gap: 30px; align-items: start; }
        @media (min-width: 620px) { .ll-split { grid-template-columns: 1.1fr 1fr; } }
        @keyframes ll-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
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
