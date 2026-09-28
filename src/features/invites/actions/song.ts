"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { safeHttpUrl } from "@/lib/validation";
import { songFromUrl } from "../utils/song";
import type { SongDetails } from "../types";

const oembedSchema = z.object({ title: z.string(), thumbnail_url: z.string().optional() });

/**
 * The Song's title and cover, from Spotify's public oEmbed (no key), so the
 * studio can show which song a pasted link is. Spotify gives no artist there.
 * For logged-in Creators only, and rate-limited, so it isn't an open proxy.
 */
export async function getSongDetails(url: string): Promise<SongDetails & { error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again.", title: "", coverUrl: null };
  if (!rateLimit(`song-details:${user.id}`, 30, 60_000)) {
    return { error: "Too many songs at once. Try again in a minute.", title: "", coverUrl: null };
  }
  const song = songFromUrl(typeof url === "string" ? url : null);
  if (!song) return { error: "That's not a Spotify song link.", title: "", coverUrl: null };

  let response: Response;
  try {
    response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(song.url)}`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86_400 },
    });
  } catch {
    return { error: "Couldn't reach Spotify. The song will still play.", title: "", coverUrl: null };
  }
  // Spotify answers 404 for a track id that doesn't exist.
  if (!response.ok) return { error: "Spotify can't find this song. Check the link.", title: "", coverUrl: null };
  const parsed = oembedSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) return { error: "Couldn't read the song from Spotify. It will still play.", title: "", coverUrl: null };
  return { title: parsed.data.title, coverUrl: safeHttpUrl(parsed.data.thumbnail_url ?? null) };
}
