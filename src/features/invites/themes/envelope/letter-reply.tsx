"use client";

import { NOTE_MAX_LENGTH } from "../../utils/answer";
import { Label, penStyle } from "./lettering";

/** "write back (optional)": the Recipient's note, on ruled lines. */
export function WriteBack({ value, onChange }: { value: string; onChange: (note: string) => void }) {
  return (
    <section style={{ marginTop: 44 }}>
      <label htmlFor="env-note">
        <Label align="center">write back (optional)</Label>
      </label>
      <textarea
        id="env-note"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={NOTE_MAX_LENGTH}
        rows={3}
        style={{
          display: "block",
          width: "100%",
          marginTop: 10,
          ...penStyle,
          lineHeight: "36px",
          background: "repeating-linear-gradient(transparent 0 35px, var(--env-rule) 35px 36px)",
          border: "none",
          outline: "none",
          resize: "none",
          padding: "0 4px",
        }}
      />
    </section>
  );
}

type ReplyActionsProps = {
  /** What's picked so far, e.g. "saturday, september 26 at 7:30 pm", or what's still missing */
  status: string;
  canSend: boolean;
  busy: boolean;
  error: string | null;
  onYes: () => void;
};

/** The pick so far (or the error), and "count me in". */
export function ReplyActions({ status, canSend, busy, error, onYes }: ReplyActionsProps) {
  const ready = canSend && !busy;
  return (
    <section style={{ marginTop: 40, textAlign: "center" }}>
      <p aria-live="polite" style={{ ...penStyle, minHeight: 30, color: error ? "var(--env-error)" : "var(--env-ink)" }}>
        {error ?? status}
      </p>
      <button
        type="button"
        onClick={onYes}
        disabled={!ready}
        style={{
          position: "relative",
          marginTop: 12,
          padding: "12px 34px 10px",
          border: "none",
          background: "none",
          fontFamily: "var(--env-marker)",
          fontSize: 30,
          color: "var(--env-ink)",
          cursor: ready ? "pointer" : "not-allowed",
          opacity: ready ? 1 : 0.35,
          transition: "opacity .2s",
        }}
      >
        <DrawnBox />
        {busy ? "sending…" : "count me in"}
      </button>
    </section>
  );
}

/** A box drawn around "count me in" in one quick pen stroke. */
function DrawnBox() {
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
      <path
        d="M6 8C60 4 140 3 194 6c2 16 2 32 0 48-54 3-130 3-188 0C4 40 3 22 7 5"
        fill="none"
        stroke="var(--env-ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        filter="url(#env-ink)"
      />
    </svg>
  );
}
