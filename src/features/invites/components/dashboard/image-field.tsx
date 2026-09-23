"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/shared/ui";
import { createImageUpload } from "../../actions";

type ImageFieldProps = {
  value: string;
  onChange: (url: string) => void;
  uploadsEnabled: boolean;
  disabled?: boolean;
  placeholder?: string;
};

/** An image link, filled either by uploading a file to storage or by pasting a URL. */
export function ImageField({ value, onChange, uploadsEnabled, disabled, placeholder }: ImageFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function upload(file: File) {
    setStatus("uploading…");
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

  return (
    <div>
      <div className="flex gap-2">
        <Input
          type="url"
          inputMode="url"
          value={value}
          disabled={disabled}
          placeholder={placeholder ?? "https://… (image link)"}
          onChange={(e) => onChange(e.target.value)}
        />
        {uploadsEnabled && (
          <>
            <button
              type="button"
              disabled={disabled || status === "uploading…"}
              onClick={() => fileInput.current?.click()}
              className="shrink-0 rounded-xl border-2 border-[var(--line)] bg-[var(--paper)] px-3 text-sm text-[var(--ink)] hover:bg-[var(--paper-2)] disabled:opacity-50"
            >
              upload
            </button>
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
          </>
        )}
      </div>
      {status && <p className="mt-1 text-xs text-[var(--ink-soft)]">{status}</p>}
      {value && /^(https:\/\/|\/)/.test(value) && (
        // eslint-disable-next-line @next/next/no-img-element -- small preview of an arbitrary URL
        <img src={value} alt="" className="mt-2 h-20 w-20 rounded-lg border border-[var(--line)]/30 object-cover" />
      )}
    </div>
  );
}
