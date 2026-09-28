/** A Song the Creator linked: which service it's on and the track or video there. */
export type SongLink = {
  service: "youtube" | "spotify";
  /** The YouTube video id or Spotify track id */
  id: string;
  /** The canonical link, saved on the Invite */
  url: string;
};

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
function youtubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  const [first, second] = url.pathname.split("/").filter(Boolean);
  let id: string | null | undefined = null;
  if (host === "youtu.be") id = first;
  else if (YOUTUBE_HOSTS.has(host)) {
    if (first === "watch") id = url.searchParams.get("v");
    else if (first === "shorts" || first === "embed" || first === "live") id = second;
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

const SPOTIFY_ID = /^[0-9A-Za-z]{22}$/;

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

const SPOTIFY_SHORT_HOSTS = new Set(["spotify.link", "spoti.fi"]);

const refuse = (reason: string): RecognizedSong => ({ ok: false, reason });

/**
 * Whether what the Creator pasted is a Song we can play, and which one. A
 * refusal says what to paste instead. YouTube and Spotify only, one song each.
 */
export function recognizeSong(input: string): RecognizedSong {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return refuse("Paste a YouTube or Spotify link to one song");
  }
  const host = url.hostname.toLowerCase();

  if (host === "youtu.be" || YOUTUBE_HOSTS.has(host)) {
    const id = youtubeId(url);
    if (id) return { ok: true, song: { service: "youtube", id, url: `https://www.youtube.com/watch?v=${id}` } };
    if (url.pathname === "/playlist") return refuse("That's a YouTube playlist. Paste the link to one video");
    return refuse("Paste the link to one YouTube video");
  }

  // Short links need a network hop to resolve; the app's "Copy song link" gives the full one.
  if (SPOTIFY_SHORT_HOSTS.has(host)) return refuse("Open this in Spotify, tap Share, then Copy song link and paste that");
  const item = spotifyItem(url);
  if (item) {
    if (item.kind === "track" && SPOTIFY_ID.test(item.id)) {
      return { ok: true, song: { service: "spotify", id: item.id, url: `https://open.spotify.com/track/${item.id}` } };
    }
    if (item.kind === "track") return refuse("Paste the link to one Spotify song");
    return refuse(`That's a Spotify ${item.kind}. Paste the link to one song`);
  }

  return refuse("We can play YouTube and Spotify links for now");
}
