import { useQuery } from "@tanstack/react-query";
import { runAction } from "@/lib/query/action";
import { getSongDetails } from "../actions";
import type { SongDetails } from "../types";
import { songFromUrl } from "../utils/song";

/**
 * The title and cover of the Song link in the studio field, once it's a
 * Spotify song link; nothing while it isn't. The same song is looked up once.
 */
export function useSongDetails(songUrl: string) {
  const canonical = songFromUrl(songUrl)?.url ?? null;
  return useQuery({
    queryKey: ["song-details", canonical],
    queryFn: async (): Promise<SongDetails> => {
      const { title, coverUrl } = await runAction(() => getSongDetails(canonical!));
      return { title, coverUrl };
    },
    enabled: canonical !== null,
    staleTime: Infinity,
    retry: false,
  });
}
