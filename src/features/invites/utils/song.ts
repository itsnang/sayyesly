/**
 * A Song the Creator linked: one track on Spotify. Spotify only, because its
 * small player can sit at the edge of the screen while the Song plays;
 * YouTube's player has to stay large and visible (see itsnang/sayyesly#101).
 */
export type SongLink = {
  /** The Spotify track id */
  id: string;
  /** The canonical link, saved on the Invite */
  url: string;
};

export type RecognizedSong = { ok: true; song: SongLink } | { ok: false; reason: string };

const SPOTIFY_ID = /^[0-9A-Za-z]{22}$/;
const SPOTIFY_SHORT_HOSTS = new Set(["spotify.link", "spoti.fi"]);

/** What a Spotify link points at ("track", "album", …) and its id, or null. */
function spotifyItem(url: URL): { kind: string; id: string } | null {
  if (url.protocol === "spotify:") {
    // spotify:track:<id>, or older ones like spotify:user:<name>:playlist:<id>: the last two parts.
    const [kind, id] = url.pathname.split(":").slice(-2);
    return kind && id ? { kind, id } : null;
  }
  if (url.hostname.toLowerCase() !== "open.spotify.com") return null;
  // /intl-fr/track/<id> and /embed/track/<id> are the same track.
  const parts = url.pathname.split("/").filter((p) => p && p !== "embed" && !p.startsWith("intl-"));
  const [kind, id] = parts;
  return kind && id ? { kind, id } : null;
}

const refuse = (reason: string): RecognizedSong => ({ ok: false, reason });

/** Whether what the Creator pasted is a Song we can play, and which one. A refusal says what to paste instead. */
export function recognizeSong(input: string): RecognizedSong {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return refuse("Paste a Spotify link to one song");
  }

  // Short links need a network hop to resolve; the app's "Copy song link" gives the full one.
  if (SPOTIFY_SHORT_HOSTS.has(url.hostname.toLowerCase())) {
    return refuse("Open this in Spotify, tap Share, then Copy song link and paste that");
  }
  const item = spotifyItem(url);
  if (!item) return refuse("Songs play from Spotify. Find it there, then Share → Copy song link");
  if (item.kind !== "track") return refuse(`That's a Spotify ${item.kind}. Paste the link to one song`);
  if (!SPOTIFY_ID.test(item.id)) return refuse("Paste the link to one Spotify song");
  return { ok: true, song: { id: item.id, url: `https://open.spotify.com/track/${item.id}` } };
}

/** The Song on an Invite from its saved link, or null when there's none (or it no longer counts as one). */
export function songFromUrl(url: string | null | undefined): SongLink | null {
  if (!url) return null;
  const song = recognizeSong(url);
  return song.ok ? song.song : null;
}
