"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Field, Input } from "@/components/shared/ui";
import type { InviteFormValues } from "../../../schemas";
import { DEFAULT_SONG_LENGTH, songFromUrl } from "../../../utils/song";
import { SongDetails } from "./song-details";
import { SongPartPicker } from "./song-part-picker";

/**
 * The Song: its YouTube link, what it is, and the part that plays. Pasting a
 * different song starts its part from the beginning again.
 */
export function SongField() {
  const { register, control, setValue, formState } = useFormContext<InviteFormValues>();
  const [songUrl, songStart, songLength] = useWatch({ control, name: ["songUrl", "songStart", "songLength"] });
  const inputId = useId();
  const song = songFromUrl(songUrl);
  const songId = song?.id ?? null;

  const lastSongId = useRef(songId);
  useEffect(() => {
    if (songId && lastSongId.current && songId !== lastSongId.current) setValue("songStart", 0, { shouldDirty: true });
    lastSongId.current = songId ?? lastSongId.current;
  }, [songId, setValue]);

  // `byCreator` is false when the picker only moved a saved part to fit the song: not a change to save.
  const setPart = useCallback(
    (start: number, length: number, byCreator: boolean) => {
      setValue("songStart", start, { shouldDirty: byCreator });
      setValue("songLength", length, { shouldDirty: byCreator });
    },
    [setValue],
  );

  return (
    // `htmlFor`: the part picker lives in this field, and its clicks mustn't focus the link box.
    <Field label="Song" optional htmlFor={inputId} hint="Plays in the background once they tap. In YouTube: Share → Copy link." error={formState.errors.songUrl?.message}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
        <Input id={inputId} {...register("songUrl")} type="url" inputMode="url" placeholder="https://youtu.be/…" />
        <SongDetails songUrl={songUrl ?? ""} />
        {song && <SongPartPicker key={song.id} song={song} start={songStart ?? 0} length={songLength ?? DEFAULT_SONG_LENGTH} onChange={setPart} />}
      </div>
    </Field>
  );
}
