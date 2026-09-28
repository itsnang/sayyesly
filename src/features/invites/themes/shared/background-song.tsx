"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { SongClip } from "../../utils/song";
import { listenToPlayer, PLAYER_STATE, playerCommand, playerSrc } from "../../utils/youtube-player";

/*
 * The Song as background audio: a YouTube player kept out of sight, started by
 * the Recipient's first tap (Envelope's "tap to open", anywhere on Kitten Soft).
 * It plays the part the Creator chose, over and over.
 *
 * The owner's decision, made knowing the trade-off (itsnang/sayyesly#101):
 * YouTube's terms require its player to stay visible (200×200 or larger), so a
 * hidden one can be blocked by YouTube at any time; iPhones may also refuse to
 * play it. When it doesn't play, nothing breaks: the Invite is just silent.
 *
 * It loads with the Invite (not at the tap), so the player is ready and the tap
 * itself can start it: browsers only allow sound shortly after a tap.
 */

// After the tap, keep asking it to play until it says it is (its script may still be starting).
const RETRY_EVERY_MS = 400;
const RETRY_FOR_MS = 4000;

/** Plays the chosen part of `song` in the background, repeating, once `playing` turns true (the first tap). */
export function BackgroundSong({ song, playing }: { song: SongClip; playing: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const started = useRef(false);
  // The player must know our origin to accept commands; only known in the browser (null while server rendering).
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => null,
  );

  // Keep it inside the part: YouTube honours `end` only on the first pass, so
  // jump back to the start whenever it reaches the end (or the video ends).
  useEffect(() => {
    if (!loaded) return;
    const end = song.start + song.length;
    const repeat = () => {
      playerCommand(frame.current, "seekTo", [song.start, true]);
      playerCommand(frame.current, "playVideo");
    };
    return listenToPlayer(frame.current, (info) => {
      if (info.playerState === PLAYER_STATE.playing) started.current = true;
      if (!started.current) return;
      if (info.playerState === PLAYER_STATE.ended || (info.currentTime !== undefined && info.currentTime >= end)) repeat();
    });
  }, [loaded, song.start, song.length]);

  useEffect(() => {
    if (!playing || !loaded) return;
    const play = () => {
      playerCommand(frame.current, "unMute");
      playerCommand(frame.current, "playVideo");
    };
    play();
    const until = Date.now() + RETRY_FOR_MS;
    const timer = setInterval(() => {
      if (started.current || Date.now() > until) clearInterval(timer);
      else play();
    }, RETRY_EVERY_MS);
    return () => clearInterval(timer);
  }, [playing, loaded]);

  // Stop when they leave the tab or app; carry on when they come back.
  useEffect(() => {
    if (!playing) return;
    const onVisibility = () => playerCommand(frame.current, document.hidden ? "pauseVideo" : "playVideo");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [playing]);

  if (!origin) return null;
  return (
    <iframe
      ref={frame}
      title="Background song"
      aria-hidden="true"
      tabIndex={-1}
      src={playerSrc(song.id, origin, {
        controls: "0",
        start: String(song.start),
        end: String(song.start + song.length),
      })}
      allow="autoplay; encrypted-media"
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => setLoaded(true)}
      // Out of sight but still "on screen": a zero-size or off-page player is more likely to be paused.
      style={{ position: "fixed", right: 0, bottom: 0, width: 2, height: 2, opacity: 0, pointerEvents: "none", border: 0 }}
    />
  );
}
