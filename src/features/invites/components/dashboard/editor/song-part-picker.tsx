"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { cx } from "@/components/shared/ui";
import { clipStart, SONG_LENGTHS, type SongLength, type SongLink } from "../../../utils/song";
import { listenToPlayer, playerCommand, playerSrc } from "../../../utils/youtube-player";

/*
 * Choosing the part of the Song that plays, like adding music on Instagram:
 * a length (15, 30 or 60 seconds), then drag the window along the song's
 * timeline to where it starts, and listen to it. The preview here is YouTube's
 * visible player: only the Creator sees the studio.
 */

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

type Props = {
  song: SongLink;
  start: number;
  length: number;
  /** `byCreator` is false when the picker only moved a saved part to fit the song, so the form isn't marked changed. */
  onChange: (start: number, length: number, byCreator: boolean) => void;
};

export function SongPartPicker({ song, start, length, onChange }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => null,
  );

  const send = (func: Parameters<typeof playerCommand>[1], args: unknown[] = []) => playerCommand(frame.current, func, args);

  // The player says how long the song is once we tell it we're listening.
  useEffect(() => {
    if (!loaded) return;
    return listenToPlayer(frame.current, (info) => {
      if (info.duration) setDuration(info.duration);
    });
  }, [loaded]);

  // A song shorter than the saved part: move the part back inside it.
  useEffect(() => {
    if (duration === null) return;
    const fitted = clipStart(start, length, duration);
    if (fitted !== start) onChange(fitted, length, false);
  }, [duration, start, length, onChange]);

  useEffect(() => () => void (stopTimer.current && clearTimeout(stopTimer.current)), []);

  function stop() {
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = null;
    send("pauseVideo");
    setListening(false);
  }

  function listen(from = start, forLength = length) {
    if (stopTimer.current) clearTimeout(stopTimer.current);
    send("seekTo", [from, true]);
    send("unMute");
    send("playVideo");
    setListening(true);
    stopTimer.current = setTimeout(stop, forLength * 1000);
  }

  function moveTo(next: number, nextLength = length) {
    const fitted = clipStart(next, nextLength, duration);
    onChange(fitted, nextLength, true);
    // Hear it from the new spot, as on Instagram.
    if (listening) listen(fitted, nextLength);
  }

  function dragTo(e: PointerEvent<HTMLDivElement>) {
    if (!track.current || duration === null) return;
    const box = track.current.getBoundingClientRect();
    const at = ((e.clientX - box.left) / box.width) * duration;
    // Grab the window by its middle.
    moveTo(at - length / 2);
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 5 : 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") moveTo(start - step);
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") moveTo(start + step);
    else if (e.key === "Home") moveTo(0);
    else if (e.key === "End" && duration !== null) moveTo(duration);
    else return;
    e.preventDefault();
  }

  const known = duration !== null && duration > 0;

  return (
    <div className="grid gap-3 rounded-[8px] border border-ink/10 bg-white p-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-[6px] bg-black">
        {origin && (
          <iframe
            ref={frame}
            title="Song preview"
            src={playerSrc(song.id, origin, { rel: "0" })}
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 size-full border-0"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div role="radiogroup" aria-label="How long it plays" className="inline-flex rounded-[7px] border border-ink/15 p-0.5 text-[13px]">
          {SONG_LENGTHS.map((n: SongLength) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={length === n}
              onClick={() => moveTo(start, n)}
              className={cx("rounded-[5px] px-2.5 py-1", length === n ? "bg-ink text-white" : "text-muted hover:text-ink")}
            >
              {n}s
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => (listening ? stop() : listen())}
          disabled={!loaded}
          className="rounded-[7px] border border-ink/15 px-3 py-1 text-[13px] text-ink hover:bg-ink/5 disabled:opacity-50"
        >
          {listening ? "Stop" : "▶ Play this part"}
        </button>
      </div>

      <div>
        <div
          ref={track}
          role="slider"
          tabIndex={known ? 0 : -1}
          aria-label="Where the part starts"
          aria-valuemin={0}
          aria-valuemax={known ? Math.max(0, Math.floor(duration - length)) : 0}
          aria-valuenow={start}
          aria-valuetext={`from ${time(start)} to ${time(start + length)}`}
          aria-disabled={!known}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragTo(e);
          }}
          onPointerMove={(e) => e.buttons === 1 && dragTo(e)}
          className={cx(
            "relative h-10 touch-none rounded-[6px] bg-ink/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
            known ? "cursor-grab active:cursor-grabbing" : "opacity-60",
          )}
        >
          {/* A little "waveform" so the strip reads as the song */}
          <div aria-hidden className="absolute inset-x-2 top-1/2 flex h-5 -translate-y-1/2 items-center gap-[3px] overflow-hidden">
            {Array.from({ length: 48 }, (_, i) => (
              <span key={i} className="w-[3px] shrink-0 rounded-full bg-ink/20" style={{ height: `${30 + ((i * 37) % 70)}%` }} />
            ))}
          </div>
          {known && (
            <div
              aria-hidden
              className="absolute inset-y-0 rounded-[6px] border-2 border-ink bg-ink/10"
              style={{
                left: `${(start / duration) * 100}%`,
                width: `${Math.min(100, (length / duration) * 100)}%`,
              }}
            />
          )}
        </div>
        <p className="mt-1.5 flex justify-between text-[12.5px] text-muted">
          <span>{known ? `Plays ${time(start)} – ${time(Math.min(start + length, duration))}, over and over` : "Loading the song…"}</span>
          {known && <span>{time(duration)}</span>}
        </p>
      </div>
    </div>
  );
}
