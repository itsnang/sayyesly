"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { PublicInvite } from "../../types";
import { sizeForQuestion } from "./lettering";
import { FIBRES, GRAIN } from "./ornaments";

type Stage = "sealed" | "opening" | "leaving";

// Long enough after the card is out to read the question on it.
const LEAVE_AFTER_MS = 2900;
const FADE_MS = 520;

/**
 * The sealed envelope the Recipient opens first. One tap lifts the flap and slides
 * the card out with the question; after a moment the letter itself opens.
 */
export function SealedEnvelope({
  invite,
  onOpen,
  onRead,
}: {
  invite: PublicInvite;
  /** The "tap to open" tap itself, while the browser still counts it as the Recipient's (the Song starts here) */
  onOpen?: () => void;
  /** The letter is ready to show, once the envelope has opened */
  onRead: () => void;
}) {
  const [stage, setStage] = useState<Stage>("sealed");
  const lifted = stage !== "sealed";
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function open() {
    if (stage !== "sealed") return;
    setStage("opening");
    onOpen?.();
    timers.current.push(
      setTimeout(() => setStage("leaving"), LEAVE_AFTER_MS),
      setTimeout(onRead, LEAVE_AFTER_MS + FADE_MS),
    );
  }

  const question = invite.question.map((s) => s.text).join("");
  const details = [invite.plan.place, invite.plan.activity].filter(Boolean);

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 20px 48px",
        background: `${GRAIN}, var(--env-table)`,
        opacity: stage === "leaving" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <button
        type="button"
        onClick={open}
        aria-label="Open the envelope"
        disabled={stage !== "sealed"}
        style={{
          position: "relative",
          width: "min(330px, 84vw)",
          aspectRatio: "1 / 0.72",
          border: "none",
          background: "none",
          padding: 0,
          cursor: stage === "sealed" ? "pointer" : "default",
          perspective: 1000,
          animation: "env-rise .8s ease-out both",
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
        <Piece clip="inset(0)" tone="var(--env-envelope-in)" z={0} />

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
          <Piece clip="polygon(0 0, 100% 0, 54% 96%, 50% 100%, 46% 96%)" tone="var(--env-envelope-flap)" z={0} shadow="0 3px 3px rgba(90,68,36,.26)" />
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
          <Piece clip="inset(0)" tone="var(--env-card)" z={0} shadow="0 -1px 3px rgba(60,48,32,.12)" />
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
                fontFamily: "var(--env-marker)",
                fontSize: sizeForQuestion(question, [30, 36, 44]),
                lineHeight: 1.08,
                color: "var(--env-ink)",
                textAlign: "center",
                textWrap: "balance",
              }}
            >
              {question}
            </span>
        </span>

        {/* Pocket: the side flaps, then the bottom flap over them */}
        <Piece clip="polygon(0 0, 49% 56%, 51% 56%, 100% 0, 100% 100%, 0 100%)" tone="var(--env-envelope)" z={3} shadow="0 -2px 3px rgba(90,68,36,.2)" />
        <Piece
          clip="polygon(0 100%, 3% 90%, 40% 47%, 50% 43%, 60% 47%, 97% 90%, 100% 100%)"
          tone="var(--env-envelope-front)"
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
              fontFamily: "var(--env-print)",
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--env-ink)",
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
          fontFamily: "var(--env-pen)",
          fontSize: 24,
          color: "var(--env-ink)",
          minHeight: 30,
          opacity: stage === "sealed" ? 1 : 0,
          transition: "opacity .3s ease",
        }}
      >
        tap to open
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
    filter: `url(#env-deckle)${shadow ? ` drop-shadow(${shadow})` : ""}`,
    pointerEvents: "none",
  };
  return (
    <span style={wrap}>
      <span style={{ position: "absolute", inset: 0, clipPath: clip, background: `${GRAIN}, ${FIBRES}, ${tone}` }} />
    </span>
  );
}
