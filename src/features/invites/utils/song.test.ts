import { describe, expect, test } from "bun:test";
import { recognizeSong, songFromUrl } from "./song";

const SONG = { id: "4cOdK2wGLETKBW3PvgPWqT", url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT" };

describe("songFromUrl", () => {
  test("a saved link becomes the Song; nothing, or a link that no longer counts, becomes null", () => {
    expect(songFromUrl(SONG.url)).toEqual(SONG);
    expect(songFromUrl(null)).toBeNull();
    expect(songFromUrl("")).toBeNull();
    expect(songFromUrl("https://music.apple.com/x")).toBeNull();
    // Saved before Songs went Spotify-only
    expect(songFromUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });
});

describe("recognizeSong", () => {
  test.each([
    ["a plain song link", "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"],
    ["the app's share link", "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=a1b2c3d4e5"],
    ["a localised link", "https://open.spotify.com/intl-fr/track/4cOdK2wGLETKBW3PvgPWqT"],
    ["an embed link", "https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT"],
    ["a Spotify URI", "spotify:track:4cOdK2wGLETKBW3PvgPWqT"],
    ["spaces around it", "  https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT  "],
  ])("%s is the Song, kept as its canonical link", (_, pasted) => {
    expect(recognizeSong(pasted)).toEqual({ ok: true, song: SONG });
  });

  test.each([
    ["not a link", "our song", "Paste a Spotify link to one song"],
    ["a YouTube video", "https://youtu.be/dQw4w9WgXcQ", "Songs play from Spotify. Find it there, then Share → Copy song link"],
    ["YouTube Music", "https://music.youtube.com/watch?v=dQw4w9WgXcQ", "Songs play from Spotify. Find it there, then Share → Copy song link"],
    ["another music service", "https://music.apple.com/us/album/x/123?i=456", "Songs play from Spotify. Find it there, then Share → Copy song link"],
    ["a Spotify playlist", "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M", "That's a Spotify playlist. Paste the link to one song"],
    ["a Spotify album", "https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy", "That's a Spotify album. Paste the link to one song"],
    ["an old Spotify playlist URI", "spotify:user:someone:playlist:37i9dQZF1DXcBWIGoYBM5M", "That's a Spotify playlist. Paste the link to one song"],
    ["a Spotify short link", "https://spotify.link/AbCdEf123", "Open this in Spotify, tap Share, then Copy song link and paste that"],
    ["a broken track link", "https://open.spotify.com/track/short", "Paste the link to one Spotify song"],
  ])("rejects %s, saying what to do instead", (_, pasted, reason) => {
    expect(recognizeSong(pasted)).toEqual({ ok: false, reason });
  });
});
