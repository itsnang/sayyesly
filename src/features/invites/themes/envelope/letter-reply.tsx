"use client";

import { useRef, useState } from "react";
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
  onMaybeLater: () => void;
};

/** The pick so far (or the error), "count me in", and the quiet way out under it. */
export function ReplyActions({ status, canSend, busy, error, onYes, onMaybeLater }: ReplyActionsProps) {
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
      <div style={{ marginTop: 22 }}>
        <MaybeLater busy={busy} error={error} onConfirm={onMaybeLater} />
      </div>
    </section>
  );
}

/**
 * The quiet way out. The Recipient can't change an Answer, so it asks once more
 * in a note laid over the letter. On success the whole screen is replaced; on
 * failure the note stays open and says why.
 */
function MaybeLater({ busy, error, onConfirm }: { busy: boolean; error: string | null; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  // `error` is shared with "count me in", so only show one this note caused.
  const [sent, setSent] = useState(false);
  const link = { ...penStyle, fontSize: 22, background: "none", border: "none", textUnderlineOffset: 4, cursor: "pointer", padding: 6 } as const;
  const close = () => {
    if (!busy) dialog.current?.close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSent(false);
          dialog.current?.showModal();
        }}
        disabled={busy}
        style={{ ...link, color: "var(--env-graphite)", textDecoration: "underline" }}
      >
        i can&apos;t make it this time
      </button>

      <dialog
        ref={dialog}
        className="env-dialog"
        aria-labelledby="env-decline-title"
        onCancel={(e) => busy && e.preventDefault()}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div style={{ padding: "30px 24px 20px", textAlign: "center" }}>
          <p id="env-decline-title" style={{ fontFamily: "var(--env-marker)", fontSize: 32, lineHeight: 1.1, color: "var(--env-ink)" }}>
            can&apos;t make it this time?
          </p>
          <p style={{ ...penStyle, fontSize: 22, marginTop: 12, color: "var(--env-graphite)" }}>
            we&apos;ll let them know, gently. once it&apos;s sent, it can&apos;t be changed.
          </p>
          {sent && error && (
            <p role="alert" style={{ ...penStyle, fontSize: 20, marginTop: 10, color: "var(--env-error)" }}>
              {error}
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap-reverse", justifyContent: "center", alignItems: "center", gap: "6px 22px", marginTop: 22 }}>
            <button type="button" onClick={close} disabled={busy} style={{ ...link, color: "var(--env-graphite)" }}>
              never mind
            </button>
            <button
              type="button"
              onClick={() => {
                setSent(true);
                onConfirm();
              }}
              disabled={busy}
              style={{
                position: "relative",
                padding: "10px 26px 8px",
                border: "none",
                background: "none",
                fontFamily: "var(--env-marker)",
                fontSize: 26,
                color: "var(--env-ink)",
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              <DrawnBox />
              {busy ? "sending…" : "send it"}
            </button>
          </div>
        </div>
      </dialog>
    </>
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
