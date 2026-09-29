"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { QuestionSegment } from "../../types";
import { MAYBE_LATER_AFTER_DODGES } from "../types";
import { useRunaway } from "./use-runaway";
import { isOptimizable } from "@/lib/media";
import { KittenKeyframes, Squiggle, WobbleFilter, WobblyBorder } from "./shared";

const DEFAULT_IMAGE = "/pasted-1780506636030-0.png";

const NO_LINES = [
  "// hmm, are you sure?",
  "// that button's a placeholder ;)",
  "// error: 'no' not in spec",
  "// please reconsider",
  "// nope. try the other one",
  "// this option got deprecated",
  "// the no button is shy",
  "// 404: no not found",
  "// you can't catch it!",
  "// one more try → say yes",
  "// resubmitting as YES…",
  "// my hopes need this",
];

type AskScreenProps = {
  question: QuestionSegment[];
  message: string | null;
  imageUrl: string | null;
  busy: boolean;
  error: string | null;
  onYes: () => void;
  onDodge: (count: number) => void;
  onMaybeLater: () => void;
};

export function AskScreen({ question, message, imageUrl, busy, error, onYes, onDodge, onMaybeLater }: AskScreenProps) {
  const [promptText, setPromptText] = useState("// awaiting your answer…");
  const lineIdx = useRef(0);
  // The next line fades in shortly after a dodge; never after the screen has gone.
  const nextLine = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(nextLine.current), []);

  const onNoDodge = useCallback(
    (n: number) => {
      onDodge(n);
      setPromptText("");
      clearTimeout(nextLine.current);
      nextLine.current = setTimeout(() => {
        setPromptText(NO_LINES[lineIdx.current % NO_LINES.length] ?? "");
        lineIdx.current++;
      }, 120);
    },
    [onDodge],
  );
  const { ref: noRef, dodges, loose: noLoose, dodge, style: noStyle } = useRunaway(onNoDodge);

  const yesScale = Math.min(1 + dodges * 0.13, 2.1);
  const noShrink = Math.max(1 - dodges * 0.06, 0.5);

  return (
    <>
      <WobbleFilter />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "min(480px, 100%)",
          }}
        >
          <Image
            src={imageUrl ?? DEFAULT_IMAGE}
            unoptimized={!isOptimizable(imageUrl)}
            alt={imageUrl ? "" : "a kitten holding a hello kitty bouquet"}
            width={300}
            height={300}
            style={{
              width: "min(300px, 72vw)",
              height: "auto",
              display: "block",
              filter: "contrast(1.04)",
              marginBottom: -18,
              position: "relative",
              zIndex: 2,
              animation: "float 4s ease-in-out infinite",
            }}
            priority
          />

          <h1
            style={{
              fontFamily: "var(--hand)",
              fontWeight: 700,
              fontSize: "clamp(38px, 7vw, 62px)",
              lineHeight: 1.14,
              color: "var(--ink)",
              position: "relative",
              zIndex: 3,
            }}
          >
            {question.map((segment, i) =>
              segment.emphasis ? (
                <span key={i} style={{ position: "relative", whiteSpace: "nowrap", color: "var(--accent)" }}>
                  {segment.text}
                  <Squiggle />
                </span>
              ) : (
                segment.text
              ),
            )}
          </h1>

          {message && (
            <p
              style={{
                marginTop: 22,
                fontFamily: "var(--hand)",
                fontSize: 20,
                lineHeight: 1.35,
                color: "var(--ink-soft)",
                whiteSpace: "pre-line",
              }}
            >
              {message}
            </p>
          )}

          <div
            aria-live="polite"
            style={{
              marginTop: 20,
              fontSize: 18,
              color: "var(--ink-soft)",
              minHeight: 26,
              transition: "opacity .2s ease",
              opacity: promptText ? 1 : 0,
            }}
          >
            {promptText}
          </div>

          <div
            style={{
              marginTop: 28,
              position: "relative",
              height: 72,
              display: "flex",
              gap: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={onYes}
              disabled={busy}
              style={{
                fontFamily: "var(--marker)",
                cursor: "pointer",
                background: "var(--accent)",
                border: "none",
                padding: "15px 34px",
                fontSize: 21,
                color: "#fff",
                position: "relative",
                zIndex: 12,
                transform: `scale(${yesScale})`,
                transition: "transform .15s cubic-bezier(.2,.9,.3,1.3)",
                borderRadius: 11,
              }}
            >
              <WobblyBorder color="var(--accent)" shadow="3px 4px 0 rgba(138,45,92,0.22)" />
              yes!
            </button>

            <button
              type="button"
              ref={noRef}
              onMouseEnter={dodge}
              onClick={(e) => {
                e.preventDefault();
                dodge();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                dodge();
              }}
              style={{
                fontFamily: "var(--marker)",
                cursor: "pointer",
                background: "var(--paper)",
                border: "none",
                fontSize: 21 * noShrink,
                padding: `${15 * noShrink}px ${34 * noShrink}px`,
                color: "var(--ink)",
                ...noStyle,
                zIndex: 20,
                touchAction: "none",
                transition: noLoose
                  ? "left .17s cubic-bezier(.2,.9,.3,1.3), top .17s cubic-bezier(.2,.9,.3,1.3), font-size .15s ease, padding .15s ease"
                  : undefined,
                borderRadius: 11,
              }}
            >
              <WobblyBorder />
              no
            </button>
          </div>

          <div
            style={{
              marginTop: 20,
              fontSize: 13,
              color: "var(--ink-faint)",
              fontFamily: "var(--marker)",
            }}
          >
            hover &ldquo;no&rdquo; to see what happens ✦
          </div>

          {/* The polite way out. Never moves, so it's always reachable. */}
          {dodges >= MAYBE_LATER_AFTER_DODGES && (
            <button
              type="button"
              onClick={onMaybeLater}
              disabled={busy}
              style={{
                marginTop: 18,
                background: "none",
                border: "none",
                padding: "8px 12px",
                fontFamily: "var(--marker)",
                fontSize: 14,
                color: "var(--ink-soft)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                cursor: "pointer",
                animation: "settle .4s cubic-bezier(.2,.9,.3,1.2) both",
              }}
            >
              maybe another time?
            </button>
          )}
          {error && (
            <p role="alert" style={{ marginTop: 8, fontSize: 13, color: "var(--accent)" }}>
              {`// ${error}`}
            </p>
          )}
        </div>

        {/* Margin annotations */}
        <div
          style={{
            position: "fixed",
            fontFamily: "var(--marker)",
            color: "var(--accent)",
            fontSize: 14,
            lineHeight: 1.25,
            pointerEvents: "none",
            zIndex: 7,
            top: "18%",
            right: 32,
            transform: "rotate(3deg)",
          }}
          className="note"
        >
          {"// "}the &ldquo;no&rdquo; button
          <br />
          has trust issues
        </div>
        <div
          style={{
            position: "fixed",
            fontFamily: "var(--marker)",
            color: "var(--accent-2)",
            fontSize: 13,
            lineHeight: 1.25,
            pointerEvents: "none",
            zIndex: 7,
            bottom: "22%",
            left: 28,
            transform: "rotate(-2deg)",
          }}
          className="note"
        >
          {"// "}pick &ldquo;yes&rdquo; and
          <br />
          i&apos;ll bring flowers 🌷
        </div>
      </div>

      <KittenKeyframes />
    </>
  );
}
