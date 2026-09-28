"use client";

import Image from "next/image";
import { errorMessage } from "@/lib/query/action";
import { useSongDetails } from "../../../hooks/use-song-details";

/** Under the Song field: which song the pasted link is (title and cover), so the Creator knows it's the right one. */
export function SongDetails({ songUrl }: { songUrl: string }) {
  const details = useSongDetails(songUrl);
  if (details.fetchStatus === "idle" && !details.data && !details.error) return null;

  if (details.isPending) {
    return <p className="text-[13px] text-muted">Finding the song on Spotify…</p>;
  }
  if (details.error) {
    return <p className="text-[13px] text-muted">{errorMessage(details.error)}</p>;
  }
  const { title, coverUrl } = details.data;
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-ink/10 bg-white p-2">
      {coverUrl ? (
        // Spotify's image host, shown as is rather than run through the image optimizer.
        <Image src={coverUrl} alt="" width={40} height={40} unoptimized className="size-10 shrink-0 rounded-[4px] object-cover" />
      ) : (
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-[4px] bg-ink/5 text-ink/50">
          ♪
        </span>
      )}
      <p className="min-w-0 truncate text-[14px] text-ink">{title}</p>
    </div>
  );
}
