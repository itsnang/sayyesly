"use client";

import Image from "next/image";
import { KittenKeyframes, WobbleFilter } from "./shared";

/** Shown after "maybe another time": kind, no guilt, no second ask. */
export function MaybeLaterScreen() {
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
        }}
      >
        <div style={{ textAlign: "center", width: "min(460px, 100%)", animation: "settle .5s cubic-bezier(.2,.9,.3,1.2) both" }}>
          <Image
            src="/cat-nobg.png"
            alt="a kitten waving"
            width={180}
            height={180}
            style={{ width: "min(180px, 45vw)", height: "auto", display: "block", margin: "0 auto", opacity: 0.92 }}
            priority
          />
          <h1
            style={{
              fontFamily: "var(--hand)",
              fontWeight: 700,
              fontSize: "clamp(36px, 8vw, 54px)",
              lineHeight: 1.1,
              color: "var(--ink)",
              marginTop: 16,
            }}
          >
            that&apos;s okay 🌷
          </h1>
          <p style={{ marginTop: 16, fontFamily: "var(--hand)", fontSize: 20, lineHeight: 1.4, color: "var(--ink-soft)" }}>
            thanks for being honest. the offer stays warm whenever you&apos;re ready.
          </p>
          <p style={{ marginTop: 22, fontSize: 13, color: "var(--ink-faint)" }}>{"// answer sent. no hard feelings ✦"}</p>
        </div>
      </div>
      <KittenKeyframes />
    </>
  );
}
