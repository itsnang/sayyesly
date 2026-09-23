"use client";

import { useState } from "react";
import { buttonClass, type ButtonSize, type ButtonVariant } from "@/components/shared/ui";

/** Copies text to the clipboard and says so for a moment. */
export function CopyButton({
  text,
  label = "Copy link",
  variant = "secondary",
  size = "sm",
  className,
}: {
  text: string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
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
      className={buttonClass(variant, size, className)}
    >
      <span aria-live="polite">{copied ? "Copied ✓" : label}</span>
    </button>
  );
}
