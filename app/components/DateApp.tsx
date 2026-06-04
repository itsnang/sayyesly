"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

export default function DateApp() {
  const router = useRouter();
  const [promptText, setPromptText] = useState("// awaiting your answer…");
  const [noLoose, setNoLoose] = useState(false);
  const [noPos, setNoPos] = useState({ left: 0, top: 0 });
  const [noFontSize, setNoFontSize] = useState(21);
  const [noPadding, setNoPadding] = useState({ x: 34, y: 15 });
  const [yesScale, setYesScale] = useState(1);

  const lineIdx = useRef(0);
  const dodgeCount = useRef(0);
  const noRef = useRef<HTMLButtonElement>(null);

  const dodge = useCallback(() => {
    const n = dodgeCount.current + 1;
    dodgeCount.current = n;

    setPromptText("");
    setTimeout(() => {
      setPromptText(NO_LINES[lineIdx.current % NO_LINES.length]);
      lineIdx.current++;
    }, 120);

    setYesScale((prev) => Math.min(prev + 0.13, 2.1));

    const s = Math.max(1 - n * 0.06, 0.5);
    setNoFontSize(21 * s);
    setNoPadding({ x: 34 * s, y: 15 * s });

    if (!noLoose && noRef.current) {
      const r = noRef.current.getBoundingClientRect();
      setNoPos({ left: r.left, top: r.top });
      setNoLoose(true);
    } else {
      const pad = 18;
      const btnW = noRef.current?.offsetWidth ?? 80;
      const btnH = noRef.current?.offsetHeight ?? 50;
      const maxX = window.innerWidth - btnW - pad;
      const maxY = window.innerHeight - btnH - pad;
      setNoPos({
        left: pad + Math.random() * Math.max(maxX - pad, 0),
        top: pad + Math.random() * Math.max(maxY - pad, 0),
      });
    }
  }, [noLoose]);

  return (
    <>
      <svg
        style={{ position: "absolute", width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          <filter id="wobble">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014 0.022"
              numOctaves={2}
              seed={7}
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale={3}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

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
            src="/pasted-1780506636030-0.png"
            alt="a kitten holding a hello kitty bouquet"
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
            will you go on a{" "}
            <span
              style={{
                position: "relative",
                whiteSpace: "nowrap",
                color: "var(--accent)",
              }}
            >
              date
              <svg
                viewBox="0 0 120 16"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  left: "-4%",
                  bottom: -16,
                  width: "108%",
                  height: 16,
                  filter: "url(#wobble)",
                }}
              >
                <path
                  d="M3 9 C30 15 60 3 90 9 C103 12 112 10 117 7"
                  fill="none"
                  stroke="#e23a7a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            with me?
          </h1>

          <div
            style={{
              marginTop: 20,
              fontSize: 18,
              color: "var(--ink-soft)",
              minHeight: 26,
              transition: "opacity .2s ease",
              opacity: promptText ? 1 : 0,
            }}
          >
            <span style={{ color: "var(--ink-faint)" }}></span> {promptText}
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
              onClick={() => router.push("/picker")}
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
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  border: "2.4px solid var(--accent)",
                  borderRadius: 11,
                  filter: "url(#wobble)",
                  boxShadow: "3px 4px 0 rgba(138,45,92,0.22)",
                }}
              />
              yes!
            </button>

            <button
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
                fontSize: noFontSize,
                padding: `${noPadding.y}px ${noPadding.x}px`,
                color: "var(--ink)",
                position: noLoose ? "fixed" : "relative",
                left: noLoose ? noPos.left : undefined,
                top: noLoose ? noPos.top : undefined,
                zIndex: 20,
                transition: noLoose
                  ? "left .17s cubic-bezier(.2,.9,.3,1.3), top .17s cubic-bezier(.2,.9,.3,1.3), font-size .15s ease, padding .15s ease"
                  : undefined,
                borderRadius: 11,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  border: "2.4px solid var(--line)",
                  borderRadius: 11,
                  filter: "url(#wobble)",
                  boxShadow: "3px 4px 0 rgba(138,45,92,0.14)",
                }}
              />
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-.4deg); }
          50%       { transform: translateY(-9px) rotate(.4deg); }
        }
        @media (max-width: 860px) {
          .note { display: none !important; }
        }
      `}</style>
    </>
  );
}
