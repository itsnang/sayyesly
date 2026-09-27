"use client";

import type { ReactNode } from "react";
import type { Plan, PublicAnswer } from "../../types";
import { formatInZone } from "../shared/format";
import { Label, MapLink, penStyle } from "./lettering";
import { FlowerRow, InkCircle, Leaf, PaperPlane, Star } from "./ornaments";

/** After a Yes. `justAnswered` flies the paper airplane once; later visits just show the Answer. */
export function YesScreen({ answer, plan, timezone, justAnswered }: { answer: PublicAnswer; plan: Plan; timezone: string; justAnswered: boolean }) {
  const when = answer.startsAt ? formatInZone(answer.startsAt, timezone) : null;

  return (
    <Answered justAnswered={justAnswered}>
      {justAnswered && (
        <span aria-hidden="true" style={{ position: "fixed", left: 0, top: 0, zIndex: 40, pointerEvents: "none", animation: "env-fly 2.2s cubic-bezier(.45,.1,.35,1) forwards" }}>
          <PaperPlane size={96} />
        </span>
      )}

      <div style={{ position: "relative", display: "inline-block", marginTop: 8 }}>
        <Star size={20} style={{ position: "absolute", left: -18, top: -16 }} />
        <h1 style={{ fontFamily: "var(--env-marker)", fontWeight: 400, fontSize: "clamp(48px, 14vw, 68px)", lineHeight: 1.05, color: "var(--env-ink)" }}>
          see ya there!
        </h1>
        <Leaf size={24} style={{ position: "absolute", right: -26, bottom: -18, transform: "rotate(16deg)" }} />
      </div>

      {when && (
        <p style={{ ...penStyle, fontSize: 30, marginTop: 40, textTransform: "lowercase" }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            {when.weekday}, {when.date}
            <InkCircle pad={9} />
          </span>
          <span style={{ display: "block", marginTop: 14 }}>at {when.time}</span>
        </p>
      )}
      {plan.place && (
        <p style={{ fontFamily: "var(--env-marker)", fontSize: 36, lineHeight: 1.1, color: "var(--env-ink)", marginTop: 20 }}>{plan.place}</p>
      )}
      {plan.mapUrl && <MapLink href={plan.mapUrl} />}

      {answer.note && (
        <div style={{ marginTop: 40 }}>
          <Label align="center">you wrote</Label>
          <p style={{ ...penStyle, marginTop: 8, whiteSpace: "pre-line" }}>&ldquo;{answer.note}&rdquo;</p>
        </div>
      )}
    </Answered>
  );
}

/** After "I can't make it this time": warm, no guilt, no second ask. */
export function MaybeLaterScreen({ justAnswered }: { justAnswered: boolean }) {
  return (
    <Answered justAnswered={justAnswered}>
      <h1
        style={{
          fontFamily: "var(--env-marker)",
          fontWeight: 400,
          fontSize: "clamp(44px, 12vw, 60px)",
          lineHeight: 1.1,
          color: "var(--env-ink)",
          textWrap: "balance",
        }}
      >
        another time, then
      </h1>
      <p style={{ ...penStyle, marginTop: 20 }}>thank you for letting me know.</p>
    </Answered>
  );
}

function Answered({ justAnswered, children }: { justAnswered: boolean; children: ReactNode }) {
  return (
    <div style={{ background: "var(--env-diary)", minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 480, animation: "env-rise .7s .2s ease-out both" }}>
        <Label align="center">{justAnswered ? "your answer is on its way" : "your answer"}</Label>
        <div style={{ marginTop: 18 }}>{children}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
          <FlowerRow width={170} />
        </div>
      </div>
    </div>
  );
}
