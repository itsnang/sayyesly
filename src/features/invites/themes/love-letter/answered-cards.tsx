"use client";

import type { ReactNode } from "react";
import type { Plan, PublicAnswer } from "../../types";
import { formatWhen } from "./format";
import { FlowerRow, InkCircle, Leaf, PaperPlane, Star } from "./ornaments";

/** After the Recipient accepts, and on every later visit. `justSent` flies the paper airplane once. */
export function AcceptedPage({ answer, plan, timezone, justSent }: { answer: PublicAnswer; plan: Plan; timezone: string; justSent: boolean }) {
  const when = answer.startsAt ? formatWhen(answer.startsAt, timezone) : null;

  return (
    <Page>
      {justSent && (
        <span aria-hidden="true" style={{ position: "fixed", left: 0, top: 0, zIndex: 40, pointerEvents: "none", animation: "ll-fly 2.2s cubic-bezier(.45,.1,.35,1) forwards" }}>
          <PaperPlane size={96} />
        </span>
      )}

      <div style={{ position: "relative", display: "inline-block", marginTop: 8 }}>
        <Star size={20} style={{ position: "absolute", left: -18, top: -16 }} />
        <h1 style={{ fontFamily: "var(--ll-marker)", fontWeight: 400, fontSize: "clamp(48px, 14vw, 68px)", lineHeight: 1.05, color: "var(--ll-ink)" }}>
          see ya there!
        </h1>
        <Leaf size={24} style={{ position: "absolute", right: -26, bottom: -18, transform: "rotate(16deg)" }} />
      </div>

      {when && (
        <p style={{ ...pen, fontSize: 30, marginTop: 40 }}>
          <span style={{ position: "relative", display: "inline-block", textTransform: "lowercase" }}>
            {when.day}
            <InkCircle pad={9} />
          </span>
          <span style={{ display: "block", marginTop: 14, textTransform: "lowercase" }}>at {when.time}</span>
        </p>
      )}
      {plan.place && (
        <p style={{ fontFamily: "var(--ll-marker)", fontSize: 36, lineHeight: 1.1, color: "var(--ll-ink)", marginTop: 20 }}>{plan.place}</p>
      )}
      {plan.mapUrl && (
        <a href={plan.mapUrl} target="_blank" rel="noopener noreferrer" style={{ ...pen, display: "inline-block", marginTop: 8, textUnderlineOffset: 4 }}>
          → find it on the map
        </a>
      )}

      {answer.note && (
        <div style={{ marginTop: 40 }}>
          <Label>you wrote</Label>
          <p style={{ ...pen, marginTop: 8, whiteSpace: "pre-line" }}>&ldquo;{answer.note}&rdquo;</p>
        </div>
      )}
    </Page>
  );
}

/** After "I can't make it this time": warm, no guilt, no second ask. */
export function NotThisTimePage() {
  return (
    <Page>
      <h1 style={{ fontFamily: "var(--ll-marker)", fontWeight: 400, fontSize: "clamp(44px, 12vw, 60px)", lineHeight: 1.1, color: "var(--ll-ink)", textWrap: "balance" }}>
        another time, then
      </h1>
      <p style={{ ...pen, marginTop: 20 }}>thank you for letting me know.</p>
    </Page>
  );
}

function Page({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "var(--ll-diary)", minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 480, animation: "ll-rise .7s .2s ease-out both" }}>
        <Label>your answer is on its way</Label>
        <div style={{ marginTop: 18 }}>{children}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
          <FlowerRow width={170} />
        </div>
      </div>
    </div>
  );
}

const pen = { fontFamily: "var(--ll-pen)", fontSize: 25, lineHeight: 1.25, color: "var(--ll-ink)" } as const;

function Label({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "block",
        fontFamily: "var(--ll-print)",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: "var(--ll-graphite)",
      }}
    >
      {children}
    </span>
  );
}
