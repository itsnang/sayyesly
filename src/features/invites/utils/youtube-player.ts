/*
 * Talking to an embedded YouTube player (privacy-enhanced mode) through its
 * postMessage protocol, so no YouTube script runs on our pages. Used by the
 * Song's background player (Recipients) and the part picker (studio).
 */

export const PLAYER_ORIGIN = "https://www.youtube-nocookie.com";

/** The player's state as it reports it: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering. */
export const PLAYER_STATE = { ended: 0, playing: 1 } as const;

export type PlayerInfo = { playerState?: number; currentTime?: number; duration?: number };

type Command = "playVideo" | "pauseVideo" | "unMute" | "seekTo";

/** Sends a command to the player in `frame`; a no-op until it has loaded. */
export function playerCommand(frame: HTMLIFrameElement | null, func: Command, args: unknown[] = []): void {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), PLAYER_ORIGIN);
}

/** The player's embed URL for `videoId`, able to take commands from `origin`. */
export function playerSrc(videoId: string, origin: string, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams({ enablejsapi: "1", origin, playsinline: "1", ...extra });
  return `${PLAYER_ORIGIN}/embed/${videoId}?${params}`;
}

/**
 * Hears what the player in `frame` reports (state, time, duration). It only
 * reports after being told someone is listening. Returns the cleanup.
 */
export function listenToPlayer(frame: HTMLIFrameElement | null, onInfo: (info: PlayerInfo) => void): () => void {
  const onMessage = (e: MessageEvent) => {
    if (e.origin !== PLAYER_ORIGIN || e.source !== frame?.contentWindow || typeof e.data !== "string") return;
    try {
      const data = JSON.parse(e.data) as { info?: PlayerInfo };
      if (data.info) onInfo(data.info);
    } catch {
      // Not one of the player's messages.
    }
  };
  window.addEventListener("message", onMessage);
  frame?.contentWindow?.postMessage(JSON.stringify({ event: "listening" }), PLAYER_ORIGIN);
  return () => window.removeEventListener("message", onMessage);
}
