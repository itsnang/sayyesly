"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { InviteThemeProps } from "../types";
import { useInviteAnswer } from "../../hooks/use-invite-answer";
import { MaybeLaterScreen, YesScreen } from "./answered-screens";
import { SealedEnvelope } from "./sealed-envelope";
import { markerFont, penFont, printFont } from "./fonts";
import { LetterScreen } from "./letter-screen";
import { PaperFilters } from "./ornaments";
import { CSS_VARIABLES } from "./palette";
import { PinnedSong, preloadSongPlayer, SONG_BAR_SPACE } from "../shared/song-player";

/**
 * Envelope: an invitation rather than a question. A handmade envelope opens
 * onto the letter; the Recipient picks a time and says Yes, or says they can't
 * make it (a Maybe later). There is no runaway "No".
 */
export function EnvelopeInvite(props: InviteThemeProps) {
  const { invite } = props;
  const answering = useInviteAnswer(props);
  const [reading, setReading] = useState(false);
  // The Song plays from the "tap to open" tap on, through the letter and the answer.
  const [opened, setOpened] = useState(false);
  const song = opened ? invite.song : null;
  // Only while there's an envelope left to open: an answered Invite never plays its Song.
  const canPlay = !!invite.song && !invite.answer;
  useEffect(() => {
    if (canPlay) preloadSongPlayer();
  }, [canPlay]);
  const [justAnswered, setJustAnswered] = useState(false);

  let screen;
  if (answering.answer?.answer === "yes") {
    screen = <YesScreen answer={answering.answer} plan={invite.plan} timezone={invite.timezone} justAnswered={justAnswered} />;
  } else if (answering.answer?.answer === "maybe_later") {
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
      style={{
        ...(CSS_VARIABLES as CSSProperties),
        minHeight: "100vh",
        width: "100%",
        flexShrink: 0,
        overflowX: "clip",
        color: "var(--env-ink)",
        // Room at the bottom so the Song's bar never covers the last button.
        ...(song ? { paddingBottom: SONG_BAR_SPACE, background: "var(--env-diary)" } : {}),
      }}
    >
      <PaperFilters />
      {screen}
      {song && <PinnedSong song={song} shadow="0 12px 30px -12px rgba(38,55,196,.45)" />}
      <style>{`
        .env-split { display: grid; gap: 30px; align-items: start; }
        @media (min-width: 620px) { .env-split { grid-template-columns: 1.1fr 1fr; } }
        @keyframes env-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .env-dialog {
          width: min(380px, calc(100% - 40px)); max-width: none; margin: auto; padding: 0; border: none;
          background: var(--env-diary); color: var(--env-ink);
          box-shadow: 0 24px 60px -24px rgba(38,55,196,.45);
          rotate: -.8deg;
        }
        .env-dialog[open] { animation: env-rise .25s ease-out both; }
        .env-dialog::backdrop { background: rgba(38,55,196,.16); backdrop-filter: blur(2px); }
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
