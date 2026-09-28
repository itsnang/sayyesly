import { describe, expect, test } from "bun:test";
import { recognizeSong, songFromUrl } from "./song";

const SONG = { id: "dQw4w9WgXcQ", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" };

describe("songFromUrl", () => {
  test("a saved link becomes the Song; nothing, or a link that no longer counts, becomes null", () => {
    expect(songFromUrl(SONG.url)).toEqual(SONG);
    expect(songFromUrl(null)).toBeNull();
    expect(songFromUrl("")).toBeNull();
    // Songs are YouTube only now
    expect(songFromUrl("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT")).toBeNull();
  });
});

describe("recognizeSong", () => {
  test.each([
    ["a watch link", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    ["the app's share link", "https://youtu.be/dQw4w9WgXcQ?si=Ab12Cd34"],
    ["a Short", "https://youtube.com/shorts/dQw4w9WgXcQ?feature=share"],
    ["YouTube Music", "https://music.youtube.com/watch?v=dQw4w9WgXcQ&si=xyz"],
    ["the mobile site", "https://m.youtube.com/watch?v=dQw4w9WgXcQ"],
    ["a video in a playlist, with a start time", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123&index=2&t=45s"],
    ["an embed link", "https://www.youtube.com/embed/dQw4w9WgXcQ"],
    ["a privacy-mode embed link", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["spaces around it", "  https://youtu.be/dQw4w9WgXcQ  "],
  ])("%s is the Song, kept as its canonical link", (_, pasted) => {
    expect(recognizeSong(pasted)).toEqual({ ok: true, song: SONG });
  });

  test.each([
    ["not a link", "our song", "Paste a YouTube link to one song"],
    ["a Spotify song", "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT", "Songs play from YouTube. Find it there, then Share → Copy link"],
    ["another music service", "https://music.apple.com/us/album/x/123?i=456", "Songs play from YouTube. Find it there, then Share → Copy link"],
    ["a YouTube playlist", "https://www.youtube.com/playlist?list=PL123", "That's a YouTube playlist. Paste the link to one song"],
    ["a YouTube channel", "https://www.youtube.com/@someone", "Paste the link to one YouTube video"],
    ["a broken YouTube link", "https://youtu.be/short", "Paste the link to one YouTube video"],
  ])("rejects %s, saying what to do instead", (_, pasted, reason) => {
    expect(recognizeSong(pasted)).toEqual({ ok: false, reason });
  });
});
