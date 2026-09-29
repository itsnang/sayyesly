"use client";

import { useState } from "react";
import type { PlanChoice } from "../../hooks/use-invite-answer";
import type { PublicInvite } from "../../types";
import { formatInZone, MONTHS, parseIsoDate, timeLabel, WEEKDAYS } from "../shared/format";
import { usePlanSelection, type PlanSelection } from "../shared/use-plan-selection";
import { Label, penStyle } from "./lettering";
import { LetterPlan } from "./letter-plan";
import { ReplyActions, WriteBack } from "./letter-reply";
import { LetterWhen } from "./letter-when";
import { FlowerRow, InkCircle, Leaf, Photo, Star, Sun } from "./ornaments";

type LetterScreenProps = {
  invite: PublicInvite;
  busy: boolean;
  error: string | null;
  onYes: (choice: PlanChoice, note: string) => void;
  onMaybeLater: () => void;
};

/** What's picked so far, e.g. "saturday, september 26 at 7:30 pm", or what's still missing. */
function pickStatus(selection: PlanSelection, timezone: string): string {
  if (selection.slot) {
    const w = formatInZone(selection.slot.startsAt, timezone);
    return `${w.weekday}, ${w.date} at ${w.time}`.toLowerCase();
  }
  if (selection.date && selection.time) {
    const { month, day, weekday } = parseIsoDate(selection.date);
    return `${WEEKDAYS[weekday]}, ${MONTHS[month]} ${day} at ${timeLabel(selection.time)}`.toLowerCase();
  }
  if (selection.date) return "and a time?";
  if (selection.time) return "and a day?";
  return "";
}

/** The Invite, laid out like a page from a diary. */
export function LetterScreen({ invite, busy, error, onYes, onMaybeLater }: LetterScreenProps) {
  const { plan } = invite;
  const selection = usePlanSelection(invite);
  const [note, setNote] = useState("");
  const { choice } = selection;

  return (
    <div style={{ background: "var(--env-diary)", minHeight: "100svh" }}>
      <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", padding: "22px 22px 80px", animation: "env-rise .7s ease-out both" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <Label>
            {plan.place}
            {plan.place && plan.activity && <br />}
            {plan.activity}
          </Label>
          <Label align="right">
            a letter
            <br />
            for you
          </Label>
        </header>

        <LetterQuestion invite={invite} />

        {(invite.imageUrl || invite.message) && (
          <section className="env-split" style={{ marginTop: 40 }}>
            {invite.imageUrl && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Photo src={invite.imageUrl} alt="" width="min(300px, 88%)" tilt={-1.6} sizes="300px" priority />
              </div>
            )}
            {invite.message && <p style={{ ...penStyle, padding: "0 4px", whiteSpace: "pre-line" }}>{invite.message}</p>}
          </section>
        )}

        <LetterPlan plan={plan} />

        <div style={{ display: "flex", justifyContent: "center", margin: "46px 0 30px" }}>
          <FlowerRow width={180} />
        </div>

        <LetterWhen invite={invite} selection={selection} />
        <WriteBack value={note} onChange={setNote} />
        <ReplyActions
          status={pickStatus(selection, invite.timezone)}
          canSend={!!choice}
          busy={busy}
          error={error}
          onYes={() => choice && onYes(choice, note)}
          onMaybeLater={onMaybeLater}
        />
      </div>
    </div>
  );
}

/** The question in marker, with its highlighted words circled in ink. */
function LetterQuestion({ invite }: { invite: PublicInvite }) {
  return (
    <section style={{ position: "relative", textAlign: "center", padding: "84px 6px 10px" }}>
      <Sun size={52} style={{ position: "absolute", left: 2, top: 14 }} />
      <Star size={20} style={{ position: "absolute", right: "16%", top: 46, transform: "rotate(12deg)" }} />
      <h1
        style={{
          position: "relative",
          fontFamily: "var(--env-marker)",
          fontWeight: 400,
          fontSize: "clamp(40px, 11vw, 58px)",
          lineHeight: 1.12,
          color: "var(--env-ink)",
          maxWidth: 480,
          margin: "0 auto",
          textWrap: "balance",
        }}
      >
        {invite.question.map((s, i) =>
          s.emphasis ? (
            <span key={i} style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
              {s.text}
              <InkCircle pad={6} />
            </span>
          ) : (
            s.text
          ),
        )}
      </h1>
      <Leaf size={24} style={{ position: "absolute", right: 10, bottom: -26, transform: "rotate(18deg)" }} />
    </section>
  );
}
