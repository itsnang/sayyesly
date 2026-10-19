"use client";

import type { Plan, PublicAnswer } from "../../types";
import { Mood, ReactiveKitten } from "./kitten";
import { formatInZone, KittenKeyframes, Squiggle, WobbleFilter } from "./shared";

type DoneScreenProps = {
  answer: PublicAnswer;
  plan: Plan;
  timezone: string;
};

/** "See you then!": the agreed plan, shown right after a yes and on every later visit. */
export function DoneScreen({ answer, plan, timezone }: DoneScreenProps) {
  const when = answer.startsAt ? formatInZone(answer.startsAt, timezone) : null;

  return (
    <>
      <WobbleFilter />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", width: "min(500px, 100%)" }}>
          <div style={{ display: "flex", justifyContent: "center", animation: "pop .75s cubic-bezier(.2,.9,.3,1.6) both" }}>
            <ReactiveKitten src="/cat-nobg.png" alt="the kitten, hopping for joy" mood={Mood.Joy} width="min(220px, 55vw)" />
          </div>

          <h1
            style={{
              fontFamily: "var(--hand)",
              fontWeight: 700,
              fontSize: "clamp(44px, 9vw, 70px)",
              lineHeight: 1.1,
              color: "var(--ink)",
              marginTop: 14,
              animation: "settle .5s .12s cubic-bezier(.2,.9,.3,1.2) both",
              position: "relative",
            }}
          >
            see you{" "}
            <span style={{ position: "relative", whiteSpace: "nowrap", color: "var(--accent)" }}>
              then
              <Squiggle bottom={-14} height={14} />
            </span>
            !
          </h1>

          <div
            style={{
              background: "var(--paper-2)",
              borderRadius: 16,
              padding: "22px 36px 26px",
              marginTop: 32,
              animation: "settle .5s .28s cubic-bezier(.2,.9,.3,1.2) both",
            }}
          >
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: ".14em",
                color: "var(--ink-faint)",
                fontFamily: "var(--marker)",
                marginBottom: 14,
              }}
            >
              it&apos;s a date ✓
            </div>
            {(plan.activity ?? plan.place) && (
              <div style={{ fontFamily: "var(--hand)", fontWeight: 700, fontSize: 30, color: "var(--accent)", lineHeight: 1.05 }}>
                {plan.activity ?? plan.place}
              </div>
            )}
            {plan.activity && plan.place && <div style={{ marginTop: 6, fontFamily: "var(--hand)", fontSize: 19, color: "var(--ink-soft)" }}>📍 {plan.place}</div>}
            {when && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontFamily: "var(--hand)", fontSize: 22, color: "var(--ink)" }}>
                  {when.weekday} {when.date}
                </span>
                <span style={{ color: "var(--ink-faint)", fontSize: 18 }}>·</span>
                <span style={{ fontFamily: "var(--hand)", fontSize: 22, color: "var(--ink)" }}>{when.time}</span>
              </div>
            )}
            {plan.mapUrl && (
              <a
                href={plan.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 14,
                  fontFamily: "var(--marker)",
                  fontSize: 13,
                  color: "var(--accent)",
                  textDecoration: "none",
                  letterSpacing: ".04em",
                }}
              >
                📍 open in maps ↗
              </a>
            )}
            {(plan.dressCode || plan.notes) && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1.5px dashed var(--line)", fontFamily: "var(--hand)", fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.45 }}>
                {plan.dressCode && <div>👗 {plan.dressCode}</div>}
                {plan.notes && <div style={{ whiteSpace: "pre-line" }}>✎ {plan.notes}</div>}
              </div>
            )}
          </div>

          {answer.note && (
            <div
              style={{
                background: "var(--paper-2)",
                borderRadius: 12,
                padding: "14px 20px",
                marginTop: 20,
                animation: "settle .5s .38s cubic-bezier(.2,.9,.3,1.2) both",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".12em",
                  color: "var(--ink-faint)",
                  fontFamily: "var(--marker)",
                  marginBottom: 6,
                }}
              >
                your note
              </div>
              <div style={{ fontFamily: "var(--hand)", fontSize: 16, color: "var(--ink)", lineHeight: 1.5 }}>
                &ldquo;{answer.note}&rdquo;
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 26,
              fontSize: 14,
              color: "var(--ink-faint)",
              fontFamily: "var(--marker)",
              animation: "settle .5s .44s cubic-bezier(.2,.9,.3,1.2) both",
            }}
          >
            see you soon — i&apos;ll bring the good vibes ✦
          </div>
        </div>

        <div
          style={{
            position: "fixed",
            fontFamily: "var(--marker)",
            color: "var(--accent)",
            fontSize: 13,
            lineHeight: 1.35,
            pointerEvents: "none",
            zIndex: 7,
            top: "20%",
            right: 28,
            transform: "rotate(2.5deg)",
            textAlign: "right",
          }}
          className="note"
        >
          {"// it's official"}
          <br />
          🌷
        </div>
        {plan.place && (
          <div
            style={{
              position: "fixed",
              fontFamily: "var(--marker)",
              color: "var(--accent-2)",
              fontSize: 12,
              lineHeight: 1.35,
              pointerEvents: "none",
              zIndex: 7,
              bottom: "22%",
              left: 28,
              transform: "rotate(-2deg)",
            }}
            className="note"
          >
            {"// see you there"}
            <br />
            {plan.place}
          </div>
        )}
      </div>
      <KittenKeyframes />
    </>
  );
}
