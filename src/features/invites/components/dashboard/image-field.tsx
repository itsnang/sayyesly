"use client";

import { useRef, useState } from "react";
import { buttonClass, inputClass } from "@/components/shared/ui";
import { createImageUpload } from "../../actions";

type ImageFieldProps = {
  value: string;
  onChange: (url: string) => void;
  uploadsEnabled: boolean;
  disabled?: boolean;
  placeholder?: string;
};

/** An image, either uploaded from the device or pasted as a link. */
export function ImageField({ value, onChange, uploadsEnabled, disabled, placeholder }: ImageFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pasting, setPasting] = useState(!uploadsEnabled);

  async function upload(file: File) {
    setStatus("Uploading…");
    const ticket = await createImageUpload({ contentType: file.type, size: file.size });
    if (!ticket.uploadUrl || !ticket.publicUrl) {
      setStatus(ticket.error ?? "Upload failed.");
      return;
    }
    const res = await fetch(ticket.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": ticket.contentType ?? file.type },
      body: file,
    }).catch(() => null);
    if (!res?.ok) {
      setStatus("Upload failed. Try again, or paste an image link.");
      return;
    }
    onChange(ticket.publicUrl);
    setStatus(null);
  }

  const showPreview = value && /^(https:\/\/|\/)/.test(value);

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-[6px] border-[1.5px] border-dashed border-ink/40 bg-surface">
          {showPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary URL
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-[20px] text-faint">+</span>
          )}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {uploadsEnabled && (
            <button
              type="button"
              disabled={disabled || status === "Uploading…"}
              onClick={() => fileInput.current?.click()}
              className={buttonClass("secondary", "sm")}
            >
              {value ? "Replace" : "Upload"}
            </button>
          )}
          {uploadsEnabled && !pasting && (
            <button type="button" onClick={() => setPasting(true)} className="px-1 text-[13px] text-muted underline underline-offset-4 hover:text-ink">
              Paste a link
            </button>
          )}
          {value && (
            <button type="button" disabled={disabled} onClick={() => onChange("")} className="px-1 text-[13px] text-muted hover:text-ink">
              Remove
            </button>
          )}
        </div>
      </div>
      {pasting && (
        <input
          type="url"
          inputMode="url"
          value={value}
          disabled={disabled}
          placeholder={placeholder ?? "https://… (link to an image)"}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} mt-2`}
        />
      )}
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      {status && <p className="mt-1.5 text-[12.5px] text-muted">{status}</p>}
    </div>
  );
}
