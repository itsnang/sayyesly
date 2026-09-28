/**
 * A Song the Creator linked: one YouTube video, played as background audio
 * (see the player in themes/shared/background-song.tsx for the trade-off).
 */
export type SongLink = {
  /** The YouTube video id */
  id: string;
  /** The canonical link, saved on the Invite */
  url: string;
};

/** The Song as it plays: which video, and the part of it (from `start`, for `length` seconds, repeating). */
export type SongClip = SongLink & { start: number; length: number };

export type RecognizedSong = { ok: true; song: SongLink } | { ok: false; reason: string };

const YOUTUBE_ID = /^[\w-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/** The video id in any link the YouTube apps and site hand out, or null. */
function youtubeId(url: URL, host: string): string | null {
  const [first, second] = url.pathname.split("/").filter(Boolean);
  let id: string | null | undefined = null;
  if (host === "youtu.be") id = first;
  else if (first === "watch") id = url.searchParams.get("v");
  else if (first === "shorts" || first === "embed" || first === "live") id = second;
  return id && YOUTUBE_ID.test(id) ? id : null;
}

const refuse = (reason: string): RecognizedSong => ({ ok: false, reason });

/** Whether what the Creator pasted is a Song we can play, and which one. A refusal says what to paste instead. */
export function recognizeSong(input: string): RecognizedSong {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return refuse("Paste a YouTube link to one song");
  }
  const host = url.hostname.toLowerCase();
  if (host !== "youtu.be" && !YOUTUBE_HOSTS.has(host)) {
    return refuse("Songs play from YouTube. Find it there, then Share → Copy link");
  }
  const id = youtubeId(url, host);
  if (id) return { ok: true, song: { id, url: `https://www.youtube.com/watch?v=${id}` } };
  if (url.pathname === "/playlist") return refuse("That's a YouTube playlist. Paste the link to one song");
  return refuse("Paste the link to one YouTube video");
}

/** The Song on an Invite from its saved link, or null when there's none (or it no longer counts as one). */
export function songFromUrl(url: string | null | undefined): SongLink | null {
  if (!url) return null;
  const song = recognizeSong(url);
  return song.ok ? song.song : null;
}

/** How long the part of the Song that plays can be, in seconds. */
export const SONG_LENGTHS = [15, 30, 60] as const;
export type SongLength = (typeof SONG_LENGTHS)[number];
export const DEFAULT_SONG_LENGTH: SongLength = 30;

/**
 * Where the chosen part of the Song starts, in whole seconds, kept inside the
 * song: a start too late moves back so the whole part fits. `duration` is null
 * until the player has said how long the song is.
 */
export function clipStart(start: number, length: number, duration: number | null): number {
  const latest = duration === null ? Infinity : Math.max(0, duration - length);
  return Math.floor(Math.max(0, Math.min(start, latest)));
}

/** The Song on an Invite as it plays, from what's saved (or typed in the studio), or null when there's none. */
export function songClip(url: string | null | undefined, start: number | undefined, length: number | undefined): SongClip | null {
  const song = songFromUrl(url);
  if (!song) return null;
  const clipLength = (SONG_LENGTHS as readonly number[]).includes(length ?? 0) ? length! : DEFAULT_SONG_LENGTH;
  return { ...song, start: clipStart(start ?? 0, clipLength, null), length: clipLength };
}
