"use client";

import { useState } from "react";
import type { PlanChoice } from "../../hooks/use-invite-answer";
import type { Plan, PublicInvite } from "../../types";
import { NOTE_MAX_LENGTH } from "../../utils/answer";
import { usePlanSelection, type PlanSelection } from "../shared/use-plan-selection";
import { PlanGallery } from "./plan-gallery";
import { dateLabel, PlanWhen, timeLabel } from "./plan-when";
import { formatInZone, WobbleFilter, WobblyBorder } from "./shared";

type PlanScreenProps = {
  invite: PublicInvite;
  busy: boolean;
  error: string | null;
  onConfirm: (choice: PlanChoice, note: string) => void;
};

/** The line under "let's eat!": the error, the pick so far, or what's still missing. */
function pickHint(selection: PlanSelection, invite: PublicInvite, error: string | null): string {
  if (error) return `// ${error}`;
  if (selection.slot) {
    const { date, time } = formatInZone(selection.slot.startsAt, invite.timezone);
    return `${date} at ${time}  —  can't wait! ✦`;
  }
  if (selection.date && selection.time) return `${dateLabel(selection.date)} at ${timeLabel(selection.time)}  —  can't wait! ✦`;
  if (selection.date) return `${dateLabel(selection.date)} ✓  —  now pick a time ↓`;
  if (selection.time) return `${timeLabel(selection.time)} ✓  —  now pick a date ↑`;
  return invite.timeSlots.length > 0 ? "pick a time above ↑" : "pick a date & time above ↑";
}

/** After Yes: the Plan on a paper card, then picking when, a note, and confirming. */
export function PlanScreen({ invite, busy, error, onConfirm }: PlanScreenProps) {
  const selection = usePlanSelection(invite);
  const [note, setNote] = useState("");
  const { choice } = selection;
  const ready = !!choice && !busy;

  return (
    <>
      <WobbleFilter />
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "50px 16px 70px" }}>
        <div
          style={{
            position: "relative",
            background: "var(--paper)",
            width: "min(620px, 100%)",
            borderRadius: 14,
            overflow: "hidden",
            animation: "settle .45s cubic-bezier(.2,.9,.3,1.2) both",
            paddingBottom: 52,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "2.4px solid var(--line)",
              borderRadius: 14,
              filter: "url(#wobble)",
              boxShadow: "4px 5px 0 rgba(138,45,92,0.16)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <PlanGallery photos={invite.plan.photos} />

          <div style={{ padding: "0 clamp(18px, 7vw, 44px)" }}>
            <PlanDetails plan={invite.plan} />
            <PlanWhen invite={invite} selection={selection} />
            <NoteField value={note} onChange={setNote} />

            <div style={{ marginTop: 34, textAlign: "center" }}>
              <button
                type="button"
                onClick={() => choice && onConfirm(choice, note)}
                disabled={!ready}
                style={{
                  fontFamily: "var(--marker)",
                  cursor: ready ? "pointer" : "not-allowed",
                  background: "var(--accent)",
                  border: "none",
                  padding: "16px 40px",
                  fontSize: 20,
                  color: "#fff",
                  position: "relative",
                  borderRadius: 11,
                  opacity: ready ? 1 : 0.38,
                  transition: "transform .15s cubic-bezier(.2,.9,.3,1.3)",
                }}
              >
                <WobblyBorder color="var(--accent)" shadow="3px 4px 0 rgba(138,45,92,0.22)" />
                {busy ? "saving…" : "let's eat! ✦"}
              </button>
              <div
                aria-live="polite"
                style={{ marginTop: 13, fontSize: 13, color: error ? "var(--accent)" : "var(--ink-soft)", minHeight: 20, fontFamily: "var(--hand)" }}
              >
                {pickHint(selection, invite, error)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** The place in large handwriting, what you'll do, then dress code and notes. */
function PlanDetails({ plan }: { plan: Plan }) {
  return (
    <div style={{ textAlign: "center", margin: "26px 0 0" }}>
      {plan.place && <div style={{ fontFamily: "var(--hand)", fontWeight: 700, fontSize: 50, color: "var(--accent)", lineHeight: 1 }}>{plan.place}</div>}
      {plan.activity && (
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 5, letterSpacing: ".07em", textTransform: "uppercase" }}>{plan.activity}</div>
      )}
      {(plan.dressCode || plan.notes) && (
        <div style={{ marginTop: 14, fontFamily: "var(--hand)", fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.4 }}>
          {plan.dressCode && <div>dress code: {plan.dressCode}</div>}
          {plan.notes && <div style={{ whiteSpace: "pre-line" }}>{plan.notes}</div>}
        </div>
      )}
    </div>
  );
}

/** "anything to add?": the Recipient's optional note. */
function NoteField({ value, onChange }: { value: string; onChange: (note: string) => void }) {
  return (
    <div style={{ marginTop: 28 }}>
      <p style={{ fontFamily: "var(--hand)", fontSize: 17, color: "var(--ink-soft)", marginBottom: 10, textAlign: "center" }}>
        anything to add? <span style={{ color: "var(--ink-faint)", fontSize: 14 }}>(optional)</span>
      </p>
      <div style={{ position: "relative" }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={NOTE_MAX_LENGTH}
          placeholder="// e.g. maybe somewhere else? or just… hi :)"
          rows={3}
          style={{
            width: "100%",
            fontFamily: "var(--hand)",
            fontSize: 16,
            color: "var(--ink)",
            background: "var(--paper)",
            border: "none",
            borderRadius: 11,
            padding: "12px 16px",
            resize: "none",
            outline: "none",
            lineHeight: 1.6,
          }}
        />
        <WobblyBorder shadow="none" />
      </div>
    </div>
  );
}
