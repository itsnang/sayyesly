"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { RateLimit, rateLimitError } from "@/lib/rate-limit";
import { safeHttpUrl } from "@/lib/validation";
import { songFromUrl } from "../utils/song";
import type { SongDetails } from "../types";

const oembedSchema = z.object({ title: z.string(), author_name: z.string().optional(), thumbnail_url: z.string().optional() });

/**
 * The Song's title, channel and cover, from YouTube's public oEmbed (no key),
 * so the studio can show which song a pasted link is.
 * For logged-in Creators only, and rate-limited, so it isn't an open proxy.
 */
export async function getSongDetails(url: string): Promise<SongDetails & { error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again.", title: "", by: null, coverUrl: null };
  const limited = await rateLimitError(RateLimit.SongDetails, user.id);
  if (limited) return { error: limited, title: "", by: null, coverUrl: null };
  const song = songFromUrl(typeof url === "string" ? url : null);
  if (!song) return { error: "That's not a YouTube link.", title: "", by: null, coverUrl: null };

  let response: Response;
  try {
    response = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(song.url)}`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86_400 },
    });
  } catch {
    return { error: "Couldn't reach YouTube. The song will still play.", title: "", by: null, coverUrl: null };
  }
  // YouTube answers 404 for a video that doesn't exist, and 401 for one that can't be embedded.
  if (!response.ok) return { error: "YouTube can't play this one here. Try another link.", title: "", by: null, coverUrl: null };
  const parsed = oembedSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) return { error: "Couldn't read the song from YouTube. It will still play.", title: "", by: null, coverUrl: null };
  return {
    title: parsed.data.title,
    by: parsed.data.author_name ?? null,
    coverUrl: safeHttpUrl(parsed.data.thumbnail_url ?? null),
  };
}
