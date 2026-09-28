import { describe, expect, test } from "bun:test";
import { recognizeSong } from "./song";

describe("recognizeSong", () => {
  test("a YouTube watch link is a Song, kept as its canonical link", () => {
    expect(recognizeSong("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      ok: true,
      song: { service: "youtube", id: "dQw4w9WgXcQ", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    });
  });

  test.each([
    ["the app's share link", "https://youtu.be/dQw4w9WgXcQ?si=Ab12Cd34"],
    ["a Short", "https://youtube.com/shorts/dQw4w9WgXcQ?feature=share"],
    ["YouTube Music", "https://music.youtube.com/watch?v=dQw4w9WgXcQ&si=xyz"],
    ["the mobile site", "https://m.youtube.com/watch?v=dQw4w9WgXcQ"],
    ["a video in a playlist, with a start time", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123&index=2&t=45s"],
    ["an embed link", "https://www.youtube.com/embed/dQw4w9WgXcQ"],
    ["a privacy-mode embed link", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["spaces around it", "  https://youtu.be/dQw4w9WgXcQ  "],
  ])("YouTube: %s is the same Song", (_, pasted) => {
    const result = recognizeSong(pasted);
    expect(result).toEqual({
      ok: true,
      song: { service: "youtube", id: "dQw4w9WgXcQ", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    });
  });

  test.each([
    ["the app's share link", "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=a1b2c3d4e5"],
    ["a localised link", "https://open.spotify.com/intl-fr/track/4cOdK2wGLETKBW3PvgPWqT"],
    ["an embed link", "https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT"],
    ["a Spotify URI", "spotify:track:4cOdK2wGLETKBW3PvgPWqT"],
  ])("Spotify: %s is the same Song", (_, pasted) => {
    expect(recognizeSong(pasted)).toEqual({
      ok: true,
      song: { service: "spotify", id: "4cOdK2wGLETKBW3PvgPWqT", url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT" },
    });
  });

  test.each([
    ["not a link", "our song", "Paste a YouTube or Spotify link to one song"],
    ["another music service", "https://music.apple.com/us/album/x/123?i=456", "We can play YouTube and Spotify links for now"],
    ["a Spotify playlist", "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M", "That's a Spotify playlist. Paste the link to one song"],
    ["a Spotify album", "https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy", "That's a Spotify album. Paste the link to one song"],
    ["an old Spotify playlist URI", "spotify:user:someone:playlist:37i9dQZF1DXcBWIGoYBM5M", "That's a Spotify playlist. Paste the link to one song"],
    ["a Spotify short link", "https://spotify.link/AbCdEf123", "Open this in Spotify, tap Share, then Copy song link and paste that"],
    ["a YouTube playlist", "https://www.youtube.com/playlist?list=PL123", "That's a YouTube playlist. Paste the link to one video"],
    ["a YouTube channel", "https://www.youtube.com/@someone", "Paste the link to one YouTube video"],
    ["a broken YouTube link", "https://youtu.be/short", "Paste the link to one YouTube video"],
  ])("rejects %s, saying what to do instead", (_, pasted, reason) => {
    expect(recognizeSong(pasted)).toEqual({ ok: false, reason });
  });
});
