"use client";

import { useState, type CSSProperties } from "react";
import type { PublicInvite } from "../../types";
import { FIBRES, GRAIN } from "./ornaments";

type Stage = "sealed" | "opening" | "open" | "leaving";

/**
 * The first thing the Recipient sees: a handmade envelope. One tap lifts the flap
 * and slides the card up with the question on it; tapping the card opens the letter.
 */
export function Envelope({ invite, onRead }: { invite: PublicInvite; onRead: () => void }) {
  const [stage, setStage] = useState<Stage>("sealed");
  const lifted = stage !== "sealed";

  function tap() {
    if (stage === "sealed") {
      setStage("opening");
      setTimeout(() => setStage("open"), 1150);
    } else if (stage === "open") {
      setStage("leaving");
      setTimeout(onRead, 520);
    }
  }

  const question = invite.question.map((s) => s.text).join("");
  const questionSize = question.length > 34 ? 30 : question.length > 22 ? 36 : 44;
  const details = [`for ${invite.recipientName}`, invite.plan.place, invite.plan.activity].filter(Boolean);

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 20px 48px",
        background: `${GRAIN}, var(--ll-table)`,
        opacity: stage === "leaving" ? 0 : 1,
        transition: "opacity .5s ease",
      }}
    >
      <button
        type="button"
        onClick={tap}
        aria-label={stage === "sealed" ? "Open the envelope" : "Read the letter"}
        style={{
          position: "relative",
          width: "min(330px, 84vw)",
          aspectRatio: "1 / 0.72",
          border: "none",
          background: "none",
          padding: 0,
          cursor: stage === "sealed" || stage === "open" ? "pointer" : "default",
          perspective: 1000,
          animation: "ll-rise .8s ease-out both",
        }}
      >
        {/* Its shadow on the table */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "2%",
            right: "2%",
            bottom: "-7%",
            height: "20%",
            background: "radial-gradient(50% 50% at 50% 50%, rgba(90,68,36,.28), transparent 70%)",
            filter: "blur(6px)",
          }}
        />

        {/* Inside of the envelope */}
        <Piece clip="inset(0)" tone="var(--ll-envelope-in)" z={0} />

        {/* Flap: closed over the card, then folded up behind it */}
        <span
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: "62%",
            transformOrigin: "top",
            transform: lifted ? "rotateX(180deg)" : "none",
            transition: "transform .6s cubic-bezier(.45,.05,.3,1)",
            zIndex: lifted ? 1 : 5,
            transitionProperty: "transform, z-index",
            transitionDelay: lifted ? "0s, .3s" : "0s",
          }}
        >
          <Piece clip="polygon(0 0, 100% 0, 54% 96%, 50% 100%, 46% 96%)" tone="var(--ll-envelope-flap)" z={0} shadow="0 3px 3px rgba(90,68,36,.26)" />
        </span>

        {/* The card */}
        <span
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            top: "5%",
            height: "90%",
            zIndex: 2,
            transform: lifted ? "translateY(-52%)" : "none",
            transition: "transform .9s .38s cubic-bezier(.3,.7,.25,1)",
          }}
        >
          <Piece clip="inset(0)" tone="var(--ll-card)" z={0} shadow="0 -1px 3px rgba(60,48,32,.12)" />
          <span
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                height: "100%",
                padding: "12% 10% 0",
                fontFamily: "var(--ll-marker)",
                fontSize: questionSize,
                lineHeight: 1.08,
                color: "var(--ll-ink)",
                textAlign: "center",
                textWrap: "balance",
              }}
            >
              {question}
            </span>
        </span>

        {/* Pocket: the side flaps, then the bottom flap over them */}
        <Piece clip="polygon(0 0, 49% 56%, 51% 56%, 100% 0, 100% 100%, 0 100%)" tone="var(--ll-envelope)" z={3} shadow="0 -2px 3px rgba(90,68,36,.2)" />
        <Piece
          clip="polygon(0 100%, 3% 90%, 40% 47%, 50% 43%, 60% 47%, 97% 90%, 100% 100%)"
          tone="var(--ll-envelope-front)"
          z={4}
          shadow="0 -3px 4px rgba(90,68,36,.26)"
        />
        <span
            style={{
              position: "absolute",
              zIndex: 4,
              left: 0,
              right: 0,
              bottom: "13%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              fontFamily: "var(--ll-print)",
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--ll-ink)",
            }}
          >
            {details.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </span>
      </button>

      <p
        aria-live="polite"
        style={{
          marginTop: 34,
          fontFamily: "var(--ll-pen)",
          fontSize: 24,
          color: "var(--ll-ink)",
          minHeight: 30,
          opacity: stage === "sealed" || stage === "open" ? 1 : 0,
          transition: "opacity .3s ease",
        }}
      >
        {stage === "sealed" ? "tap to open" : stage === "open" ? "tap the card to read it" : ""}
      </p>
    </div>
  );
}

/** One layer of the envelope. The filter sits outside the clip so the torn edge follows the shape. */
function Piece({ clip, tone, z, shadow }: { clip: string; tone: string; z: number; shadow?: string }) {
  const wrap: CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: z,
    filter: `url(#ll-deckle)${shadow ? ` drop-shadow(${shadow})` : ""}`,
    pointerEvents: "none",
  };
  return (
    <span style={wrap}>
      <span style={{ position: "absolute", inset: 0, clipPath: clip, background: `${GRAIN}, ${FIBRES}, ${tone}` }} />
    </span>
  );
}
