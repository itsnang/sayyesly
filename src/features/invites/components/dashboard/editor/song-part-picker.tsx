"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { cx } from "@/components/shared/ui";
import { clipStart, SONG_LENGTHS, type SongLength, type SongLink } from "../../../utils/song";
import { listenToPlayer, PLAYER_STATE, playerCommand, playerSrc } from "../../../utils/youtube-player";

/*
 * Choosing the part of the Song that plays, like adding music on Instagram:
 * pick a length (15, 30 or 60 seconds), drag the window along the song, and
 * let go to hear that part, looping, with a playhead moving through it. The
 * preview is YouTube's visible player: only the Creator sees the studio.
 *
 * While dragging only the window moves (a local draft); the form and the
 * player follow on release, so the drag stays smooth.
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
  const [loaded, setLoaded] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  // While dragging: where the window is, and where in it the finger took hold.
  const [draft, setDraft] = useState<number | null>(null);
  const grab = useRef(0);
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => null,
  );

  // The player's reports read the latest part and play state through refs.
  const part = useRef({ start, length, playing });
  useEffect(() => {
    part.current = { start, length, playing };
  }, [start, length, playing]);

  const send = (func: Parameters<typeof playerCommand>[1], args: unknown[] = []) => playerCommand(frame.current, func, args);

  function playFrom(from: number) {
    send("seekTo", [from, true]);
    send("unMute");
    send("playVideo");
    setNow(from);
    setPlaying(true);
  }

  function pause() {
    send("pauseVideo");
    setPlaying(false);
  }

  // How long the song is, where it's at, and keeping it inside the part while it plays.
  useEffect(() => {
    if (!loaded) return;
    return listenToPlayer(frame.current, (info) => {
      if (info.duration) setDuration(info.duration);
      const { start: s, length: l, playing: p } = part.current;
      if (info.currentTime !== undefined) {
        setNow(info.currentTime);
        if (p && info.currentTime >= s + l) playerCommand(frame.current, "seekTo", [s, true]);
      }
      if (p && info.playerState === PLAYER_STATE.ended) {
        playerCommand(frame.current, "seekTo", [s, true]);
        playerCommand(frame.current, "playVideo");
      }
    });
  }, [loaded]);

  // A song shorter than the saved part: move the part back inside it.
  useEffect(() => {
    if (duration === null) return;
    const fitted = clipStart(start, length, duration);
    if (fitted !== start) onChange(fitted, length, false);
  }, [duration, start, length, onChange]);

  /** Saves a new part and plays it, as on Instagram. */
  function choose(next: number, nextLength = length) {
    const fitted = clipStart(next, nextLength, duration);
    onChange(fitted, nextLength, true);
    if (loaded) playFrom(fitted);
  }

  const known = duration !== null && duration > 0;
  const shown = draft ?? start;
  const secondsAt = (clientX: number) => {
    const box = track.current!.getBoundingClientRect();
    return ((clientX - box.left) / box.width) * (duration ?? 0);
  };

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!known || !track.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const at = secondsAt(e.clientX);
    // Took hold of the window: keep that spot under the finger. Elsewhere: centre the window there.
    grab.current = at >= start && at <= start + length ? at - start : length / 2;
    setDraft(clipStart(at - grab.current, length, duration));
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (draft === null) return;
    setDraft(clipStart(secondsAt(e.clientX) - grab.current, length, duration));
  }

  function onPointerUp() {
    if (draft === null) return;
    const next = draft;
    setDraft(null);
    choose(next);
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 5 : 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") choose(start - step);
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") choose(start + step);
    else if (e.key === "Home") choose(0);
    else if (e.key === "End" && duration !== null) choose(duration);
    else return;
    e.preventDefault();
  }

  // The playhead, inside the window, while the part plays.
  const progress = playing && draft === null && now !== null ? Math.min(1, Math.max(0, (now - start) / length)) : null;

  return (
    <div className="grid min-w-0 gap-3 rounded-[8px] border border-ink/10 bg-white p-3">
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

      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div role="radiogroup" aria-label="How long it plays" className="inline-flex rounded-[7px] border border-ink/15 p-0.5 text-[13px]">
          {SONG_LENGTHS.map((n: SongLength) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={length === n}
              onClick={() => choose(start, n)}
              className={cx("rounded-[5px] px-2.5 py-1", length === n ? "bg-ink text-white" : "text-muted hover:text-ink")}
            >
              {n}s
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => (playing ? pause() : playFrom(start))}
          disabled={!loaded}
          className="shrink-0 rounded-[7px] border border-ink/15 px-3 py-1 text-[13px] text-ink hover:bg-ink/5 disabled:opacity-50"
        >
          {playing ? "❚❚ Pause" : "▶ Play this part"}
        </button>
      </div>

      <div className="min-w-0">
        <div
          ref={track}
          role="slider"
          tabIndex={known ? 0 : -1}
          aria-label="Where the part starts"
          aria-valuemin={0}
          aria-valuemax={known ? Math.max(0, Math.floor(duration - length)) : 0}
          aria-valuenow={shown}
          aria-valuetext={`from ${time(shown)} to ${time(shown + length)}`}
          aria-disabled={!known}
          onKeyDown={onKey}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cx(
            "relative h-11 touch-none overflow-hidden rounded-[6px] bg-ink/[0.06] outline-none select-none focus-visible:ring-2 focus-visible:ring-ink/40",
            known ? (draft === null ? "cursor-grab" : "cursor-grabbing") : "opacity-60",
          )}
        >
          {/* A little "waveform" so the strip reads as the song */}
          <div aria-hidden className="pointer-events-none absolute inset-x-2 top-1/2 flex h-5 -translate-y-1/2 items-center justify-between overflow-hidden">
            {Array.from({ length: 40 }, (_, i) => (
              <span key={i} className="w-[3px] shrink-0 rounded-full bg-ink/20" style={{ height: `${30 + ((i * 37) % 70)}%` }} />
            ))}
          </div>
          {known && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 overflow-hidden rounded-[6px] border-2 border-ink bg-ink/10"
              style={{ left: `${(shown / duration) * 100}%`, width: `${Math.min(100, (length / duration) * 100)}%` }}
            >
              {progress !== null && (
                <span className="absolute inset-y-0 w-[2px] bg-rose transition-[left] duration-300 ease-linear" style={{ left: `${progress * 100}%` }} />
              )}
            </div>
          )}
        </div>
        <p className="mt-1.5 flex justify-between gap-2 text-[12.5px] text-muted">
          <span className="min-w-0 truncate">
            {known ? `Plays ${time(shown)} – ${time(Math.min(shown + length, duration))}, over and over` : "Loading the song…"}
          </span>
          {known && <span className="shrink-0">{time(duration)}</span>}
        </p>
      </div>
    </div>
  );
}
