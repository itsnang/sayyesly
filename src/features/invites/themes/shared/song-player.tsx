"use client";

import { useEffect, useRef, useState } from "react";
import type { SongLink } from "../../utils/song";

/*
 * The Song's player: Spotify's own compact embed (their smallest official
 * size), pinned to the edge of the screen so the Song plays in the background.
 * Nothing may be drawn over it. Mount it right after the Recipient's first tap
 * (Envelope's "tap to open", anywhere on Kitten Soft): browsers that allow
 * sound after a tap then start it by itself, the rest show its play button.
 * Spotify plays a 30-second preview to anyone not logged in there (research:
 * itsnang/sayyesly#102).
 */

type SpotifyController = {
  play(): void;
  addListener(event: "ready", callback: () => void): void;
  destroy(): void;
};
type SpotifyIFrameApi = {
  createController(
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: number },
    callback: (controller: SpotifyController) => void,
  ): void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void;
  }
}

/** Spotify's compact player height. */
export const SONG_PLAYER_HEIGHT = 80;
// If Spotify's script loads but never says it's ready, fall back to the plain embed.
const API_TIMEOUT_MS = 8000;

// Loads once per page (one Song per Invite); our own script inserts it, which the CSP's 'strict-dynamic' trusts.
let spotifyApi: Promise<SpotifyIFrameApi> | null = null;
function loadSpotifyApi(): Promise<SpotifyIFrameApi> {
  spotifyApi ??= new Promise((resolve, reject) => {
    const fail = () => {
      spotifyApi = null;
      reject(new Error("Spotify's player didn't load"));
    };
    const timer = setTimeout(fail, API_TIMEOUT_MS);
    window.onSpotifyIframeApiReady = (api) => {
      clearTimeout(timer);
      resolve(api);
    };
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => {
      clearTimeout(timer);
      fail();
    };
    document.body.appendChild(script);
  });
  return spotifyApi;
}

/** The Song's player. `autoPlay` asks it to start as soon as it's ready (after the Recipient's first tap). */
export function SongPlayer({ song, autoPlay = false }: { song: SongLink; autoPlay?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const outer = host.current;
    if (!outer) return;
    // Spotify replaces the element it's given, so give it one React doesn't manage.
    const target = document.createElement("div");
    outer.appendChild(target);
    let controller: SpotifyController | null = null;
    let cancelled = false;
    loadSpotifyApi()
      .then((api) =>
        api.createController(target, { uri: `spotify:track:${song.id}`, width: "100%", height: SONG_PLAYER_HEIGHT }, (c) => {
          if (cancelled) return c.destroy();
          controller = c;
          if (autoPlay) c.addListener("ready", () => c.play());
        }),
      )
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      controller?.destroy();
      outer.replaceChildren();
    };
  }, [song.id, autoPlay]);

  if (failed) {
    return (
      <iframe
        title="The song, on Spotify"
        src={`https://open.spotify.com/embed/track/${song.id}`}
        width="100%"
        height={SONG_PLAYER_HEIGHT}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        style={{ border: 0, borderRadius: 12, display: "block" }}
      />
    );
  }
  return <div ref={host} style={{ height: SONG_PLAYER_HEIGHT, borderRadius: 12, overflow: "hidden" }} />;
}

/**
 * Start fetching Spotify's player script as the Invite opens, so the player is
 * ready moments after the first tap (iPhones only honour a tap for about a second).
 */
export function preloadSongPlayer(): void {
  loadSpotifyApi().catch(() => {});
}

/** Room a Theme leaves at the bottom of the page so the pinned Song never covers its last button. */
export const SONG_BAR_SPACE = SONG_PLAYER_HEIGHT + 28;

/** The Song pinned to the bottom of the screen, playing in the background. `shadow` lets a Theme tint its edge. */
export function PinnedSong({ song, shadow }: { song: SongLink; shadow: string }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "max(12px, env(safe-area-inset-bottom))",
        zIndex: 40,
        maxWidth: 420,
        margin: "0 auto",
        borderRadius: 12,
        boxShadow: shadow,
      }}
    >
      <SongPlayer song={song} autoPlay />
    </div>
  );
}
