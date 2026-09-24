"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { buttonClass, cx, inputClass } from "@/components/shared/ui";
import { isOptimizable } from "@/lib/media";
import { ImageIcon, useDropTarget } from "../image-field";
import { ACCEPTED_IMAGE_TYPES, imageFiles, uploadImage } from "../upload-image";

type Photo = { key: string; url: string };
type Pending = { key: string; preview: string; progress: number };

type PhotosFieldProps = {
  photos: Photo[];
  max: number;
  uploadsEnabled: boolean;
  disabled?: boolean;
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
  /** For photos added as a link (uploads off, or "use a link") */
  onUrlChange: (index: number, url: string) => void;
  /** The caption input for photos after the first (the first is shown big, without one) */
  caption: (index: number) => ReactNode;
  error: (index: number) => string | undefined;
};

function RemoveButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean | undefined }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Remove photo"
      className="grid size-8 shrink-0 place-items-center rounded-[6px] text-muted transition hover:bg-surface hover:text-ink disabled:opacity-40"
    >
      <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  );
}

/**
 * Photos of the place: drop or pick several at once (up to `max`); each one
 * becomes a row with its thumbnail, a caption, and remove. Links still work,
 * and are the only way when uploads aren't set up.
 */
export function PhotosField({ photos, max, uploadsEnabled, disabled, onAdd, onRemove, onUrlChange, caption, error }: PhotosFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Photos that came from an upload, or were already saved, show as a thumbnail;
  // anything else is a link someone is typing, so it keeps its input.
  const [settled, setSettled] = useState(() => new Set(photos.map((p) => p.url).filter(Boolean)));
  const room = max - photos.length - pending.length;

  async function addFiles(files: File[]) {
    setUploadError(null);
    const batch = files.slice(0, room).map((file) => ({ file, key: crypto.randomUUID(), preview: URL.createObjectURL(file) }));
    if (files.length > room) setUploadError(`Only ${max} photos fit, so the extra ones were left out.`);
    setPending((p) => [...p, ...batch.map(({ key, preview }) => ({ key, preview, progress: 0 }))]);

    // One at a time, so each gets the full connection and keeps its order.
    for (const { file, key, preview } of batch) {
      const outcome = await uploadImage(file, (progress) => setPending((p) => p.map((x) => (x.key === key ? { ...x, progress } : x))));
      setPending((p) => p.filter((x) => x.key !== key));
      URL.revokeObjectURL(preview);
      if ("url" in outcome) {
        setSettled((prev) => new Set(prev).add(outcome.url));
        onAdd(outcome.url);
      } else setUploadError(outcome.error);
    }
  }

  const drop = useDropTarget((files) => void addFiles(files), uploadsEnabled && !disabled && room > 0);

  return (
    <div>
      {(photos.length > 0 || pending.length > 0) && (
        <ul className="mb-3 divide-y divide-ink/10 rounded-[8px] border border-ink/10">
          {photos.map((photo, i) => {
            const isLink = !uploadsEnabled || !settled.has(photo.url);
            return (
              <li key={photo.key} className="p-2.5">
                <div className="flex items-center gap-3">
                  {photo.url && /^(https:\/\/|\/)/.test(photo.url) ? (
                    <Image
                      src={photo.url}
                      alt=""
                      width={56}
                      height={56}
                      unoptimized={!isOptimizable(photo.url)}
                      className="size-14 shrink-0 rounded-[6px] border border-ink/10 bg-surface object-cover"
                    />
                  ) : (
                    <span className="grid size-14 shrink-0 place-items-center rounded-[6px] border border-dashed border-ink/25 text-faint">
                      <ImageIcon />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {i === 0 ? (
                      <p className="text-[13px] text-muted">
                        <span className="font-medium text-ink">Cover</span> · shown big
                      </p>
                    ) : (
                      caption(i)
                    )}
                  </div>
                  <RemoveButton onClick={() => onRemove(i)} disabled={disabled} />
                </div>
                {isLink && (
                  <input
                    type="url"
                    inputMode="url"
                    value={photo.url}
                    disabled={disabled}
                    placeholder="https://… link to an image"
                    onChange={(e) => onUrlChange(i, e.target.value)}
                    className={`${inputClass} mt-2`}
                  />
                )}
                {error(i) && <p className="mt-1.5 text-[12.5px] font-medium text-red-700">{error(i)}</p>}
              </li>
            );
          })}
          {pending.map((p) => (
            <li key={p.key} className="flex items-center gap-3 p-2.5">
              <Image src={p.preview} alt="" width={56} height={56} unoptimized className="size-14 shrink-0 rounded-[6px] object-cover opacity-60" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-muted">Uploading {Math.round(p.progress * 100)}%</p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-[3px] bg-surface">
                  <div className="h-full bg-ink transition-[width]" style={{ width: `${Math.round(p.progress * 100)}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {room > 0 &&
        (uploadsEnabled ? (
          <button
            type="button"
            {...drop.props}
            disabled={disabled}
            onClick={() => fileInput.current?.click()}
            className={cx(
              "flex w-full items-center justify-center gap-2 rounded-[8px] border border-dashed px-3 py-4 text-[14px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:cursor-not-allowed disabled:opacity-60",
              drop.over ? "border-ink bg-rose-soft/50 text-ink" : "border-ink/25 bg-white text-ink hover:border-ink/50 hover:bg-surface/60",
            )}
          >
            <ImageIcon className="size-5 text-muted" />
            <span className="font-medium">{drop.over ? "Drop to upload" : photos.length ? "Add more photos" : "Add photos"}</span>
            <span className="text-[12.5px] text-muted">up to {room} more</span>
          </button>
        ) : (
          <button type="button" disabled={disabled} onClick={() => onAdd("")} className={buttonClass("secondary", "sm")}>
            Add a photo link
          </button>
        ))}

      {room > 0 && uploadsEnabled && (
        <button type="button" disabled={disabled} onClick={() => onAdd("")} className="mt-2 text-[13px] text-muted hover:text-ink hover:underline hover:underline-offset-4">
          Add a link instead
        </button>
      )}

      {uploadError && (
        <p role="alert" className="mt-2 text-[12.5px] font-medium text-red-700">
          {uploadError}
        </p>
      )}

      <input
        ref={fileInput}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(e) => {
          const files = imageFiles(e.target.files);
          if (files.length) void addFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
