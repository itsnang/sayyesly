"use client";

import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { buttonClass, cx, inputClass } from "@/components/shared/ui";
import { isOptimizable } from "@/lib/media";
import { useImageUpload } from "../../hooks/use-image-upload";
import { ACCEPTED_IMAGE_TYPES, imageFiles } from "./upload-image";

type ImageFieldProps = {
  value: string;
  onChange: (url: string) => void;
  uploadsEnabled: boolean;
  disabled?: boolean;
};

type Upload = { preview: string; progress: number } | null;

const isImageUrl = (v: string) => /^(https:\/\/|\/)/.test(v);

export function ImageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className ?? "size-5"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M20.5 15.5 15.5 10.5 6.5 19.5" />
    </svg>
  );
}

/** Drag-and-drop handlers plus whether something is being dragged over. */
export function useDropTarget(onFiles: (files: File[]) => void, enabled: boolean) {
  const [over, setOver] = useState(false);
  const props = enabled
    ? {
        onDragOver: (e: DragEvent) => {
          e.preventDefault();
          setOver(true);
        },
        onDragLeave: () => setOver(false),
        onDrop: (e: DragEvent) => {
          e.preventDefault();
          setOver(false);
          const files = imageFiles(e.dataTransfer.files);
          if (files.length) onFiles(files);
        },
      }
    : {};
  return { over, props };
}

/**
 * One picture: upload it (click or drop), watch it go up, then see it with
 * Replace and Remove. Pasting a link stays possible, and is the only way when
 * uploads aren't set up.
 */
export function ImageField({ value, onChange, uploadsEnabled, disabled }: ImageFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<Upload>(null);
  const [error, setError] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState(() => !uploadsEnabled || (!!value && !isImageUrl(value)));
  const images = useImageUpload();

  async function start(file: File) {
    setError(null);
    const preview = URL.createObjectURL(file);
    setUpload({ preview, progress: 0 });
    const result = await images.upload(file, (progress) => setUpload((u) => (u ? { ...u, progress } : u)));
    URL.revokeObjectURL(preview);
    if ("cancelled" in result) return; // left the page mid-upload
    setUpload(null);
    if ("url" in result) onChange(result.url);
    else setError(result.error);
  }

  const busy = !!upload;
  const pick = () => fileInput.current?.click();
  const drop = useDropTarget((files) => void start(files[0]!), uploadsEnabled && !disabled && !busy);

  const picker = (
    <input
      ref={fileInput}
      type="file"
      accept={ACCEPTED_IMAGE_TYPES}
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) void start(file);
        e.target.value = "";
      }}
    />
  );

  if (linkMode) {
    return (
      <div>
        <input
          type="url"
          inputMode="url"
          value={value}
          disabled={disabled}
          placeholder="https://… link to an image"
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {uploadsEnabled && (
          <button type="button" onClick={() => setLinkMode(false)} className="mt-2 text-[13px] text-muted hover:text-ink hover:underline hover:underline-offset-4">
            Upload from your device instead
          </button>
        )}
      </div>
    );
  }

  const shown = upload?.preview ?? (isImageUrl(value) ? value : null);

  return (
    <div>
      {shown ? (
        <div {...drop.props} className={cx("overflow-hidden rounded-[8px] border bg-surface", drop.over ? "border-ink" : "border-ink/10")}>
          <div className="relative h-44">
            <Image
              src={shown}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              unoptimized={!!upload || !isOptimizable(shown)}
              className={cx("object-contain transition-opacity", busy && "opacity-60")}
            />
            {upload && (
              <div className="absolute inset-x-3 bottom-3">
                <div className="h-1.5 overflow-hidden rounded-[3px] bg-white/80">
                  <div className="h-full bg-ink transition-[width]" style={{ width: `${Math.round(upload.progress * 100)}%` }} />
                </div>
                <p className="mt-1 text-center text-[12px] font-medium text-ink">Uploading {Math.round(upload.progress * 100)}%</p>
              </div>
            )}
          </div>
          {!busy && (
            <div className="flex gap-1 border-t border-ink/10 bg-white p-1.5">
              <button type="button" disabled={disabled} onClick={pick} className={buttonClass("ghost", "sm", "flex-1")}>
                Replace
              </button>
              <button type="button" disabled={disabled} onClick={() => onChange("")} className={buttonClass("ghost", "sm", "flex-1")}>
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          {...drop.props}
          disabled={disabled}
          onClick={pick}
          className={cx(
            "flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-[8px] border border-dashed text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:cursor-not-allowed disabled:opacity-60",
            drop.over ? "border-ink bg-rose-soft/50" : "border-ink/25 bg-white hover:border-ink/50 hover:bg-surface/60",
          )}
        >
          <ImageIcon className="size-6 text-muted" />
          <span className="text-[14px] font-medium text-ink">{drop.over ? "Drop to upload" : "Upload a photo"}</span>
          <span className="text-[12.5px] text-muted">
            <span className="max-sm:hidden">or drag one here · </span>JPG, PNG, WebP or GIF
          </span>
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-[12.5px] font-medium text-red-700">
          {error}
        </p>
      )}
      {!busy && (
        <button type="button" onClick={() => setLinkMode(true)} className="mt-2 text-[13px] text-muted hover:text-ink hover:underline hover:underline-offset-4">
          Use a link instead
        </button>
      )}
      {picker}
    </div>
  );
}
