"use client";

import { useState } from "react";

/** Copies text to the clipboard and says so for a moment. */
export function CopyButton({ text, label = "Copy link", className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          window.prompt("Copy this:", text);
        }
      }}
      className={
        className ??
        "rounded-full border border-ink/20 bg-card px-3.5 py-1.5 text-[13px] text-ink transition hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
      }
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
