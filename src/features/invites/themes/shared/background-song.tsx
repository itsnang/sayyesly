"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { SongLink } from "../../utils/song";

/*
 * The Song as background audio: a YouTube player kept out of sight, started by
 * the Recipient's first tap (Envelope's "tap to open", anywhere on Kitten Soft).
 *
 * The owner's decision, made knowing the trade-off (itsnang/sayyesly#101):
 * YouTube's terms require its player to stay visible (200×200 or larger), so a
 * hidden one can be blocked by YouTube at any time; iPhones may also refuse to
 * play it. When it doesn't play, nothing breaks: the Invite is just silent.
 *
 * It loads with the Invite (not at the tap), so the player is ready and the tap
 * itself can start it: browsers only allow sound shortly after a tap. It's
 * controlled through YouTube's postMessage commands, so no YouTube script runs
 * on our page. Privacy-enhanced mode: no YouTube cookies until it plays.
 */

const PLAYER_ORIGIN = "https://www.youtube-nocookie.com";

function command(frame: HTMLIFrameElement | null, func: "playVideo" | "unMute" | "pauseVideo") {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), PLAYER_ORIGIN);
}

// YouTube's player state for "playing" in its infoDelivery messages.
const STATE_PLAYING = 1;
// After the tap, keep asking it to play until it says it is (its script may still be starting).
const RETRY_EVERY_MS = 400;
const RETRY_FOR_MS = 4000;

/** Plays `song` in the background once `playing` turns true (the first tap). */
export function BackgroundSong({ song, playing }: { song: SongLink; playing: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const started = useRef(false);
  // The player must know our origin to accept commands; only known in the browser (null while server rendering).
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => null,
  );

  // Hear the player's state (it only reports after we say we're listening).
  useEffect(() => {
    if (!loaded) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== PLAYER_ORIGIN || e.source !== frame.current?.contentWindow || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data) as { info?: { playerState?: number } };
        if (data.info?.playerState === STATE_PLAYING) started.current = true;
      } catch {
        // Not one of the player's messages.
      }
    };
    window.addEventListener("message", onMessage);
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening" }), PLAYER_ORIGIN);
    return () => window.removeEventListener("message", onMessage);
  }, [loaded]);

  useEffect(() => {
    if (!playing || !loaded) return;
    const play = () => {
      command(frame.current, "unMute");
      command(frame.current, "playVideo");
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
    const onVisibility = () => command(frame.current, document.hidden ? "pauseVideo" : "playVideo");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [playing]);

  if (!origin) return null;
  const params = new URLSearchParams({
    enablejsapi: "1",
    origin,
    playsinline: "1",
    controls: "0",
    // Loop the one video: YouTube loops only a playlist, so it's a playlist of itself.
    loop: "1",
    playlist: song.id,
  });
  return (
    <iframe
      ref={frame}
      title="Background song"
      aria-hidden="true"
      tabIndex={-1}
      src={`${PLAYER_ORIGIN}/embed/${song.id}?${params}`}
      allow="autoplay; encrypted-media"
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => setLoaded(true)}
      // Out of sight but still "on screen": a zero-size or off-page player is more likely to be paused.
      style={{ position: "fixed", right: 0, bottom: 0, width: 2, height: 2, opacity: 0, pointerEvents: "none", border: 0 }}
    />
  );
}
