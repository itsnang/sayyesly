import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OG_IMAGE_SIZE } from "@/features/invites/themes";
import { SITE_TAGLINE, SITE_URL } from "@/lib/site";

export const alt =
  "sayyesly: two date invites on phones, a kitten Theme and a love letter shown sealed and opened";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

const PANEL = "#fbeef1";
const INK = "#2a1d24";

const PHONE_W = 228;
const PHONE_H = PHONE_W * 2; // the screenshots are 390 × 780
const FRONT_SCALE = 1.1;

const dataUrl = (base64: string) => `data:image/png;base64,${base64}`;

function Phone({ src, left, top, rotate, scale = 1 }: { src: string; left: number; top: number; rotate: number; scale?: number }) {
  const w = PHONE_W * scale;
  const h = PHONE_H * scale;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        display: "flex",
        padding: 7,
        borderRadius: 34 * scale,
        background: "#1c1418",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 40px 70px -28px rgba(80, 20, 45, 0.55)",
      }}
    >
      <img src={src} alt="" width={w} height={h} style={{ borderRadius: 27 * scale }} />
    </div>
  );
}

export default async function Image() {
  // Literal paths, so the bundler traces only these files into the image route.
  const [geist, wordmark, kitten, envelope, letter] = await Promise.all([
    readFile(join(process.cwd(), "assets/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "public/brand/wordmark.png"), "base64").then(dataUrl),
    readFile(join(process.cwd(), "public/landing/step-ask.png"), "base64").then(dataUrl),
    readFile(join(process.cwd(), "public/landing/theme-love-letter.png"), "base64").then(dataUrl),
    readFile(join(process.cwd(), "public/landing/theme-love-letter-open.png"), "base64").then(dataUrl),
  ]);

  // The wordmark image has wide transparent margins; this box crops to the lettering
  // (and its "no" pill) without editing the file. Ratios come from the 2240 × 880 source.
  const markW = 340;
  const markH = Math.round((markW * 472) / 1474);
  const markImgW = Math.round(markW * 1.52);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: PANEL,
          fontFamily: "Geist",
          color: INK,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(55% 70% at 22% 40%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%), radial-gradient(45% 60% at 80% 100%, rgba(214,69,107,0.28) 0%, rgba(214,69,107,0) 70%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 72,
            top: 0,
            bottom: 0,
            width: 520,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", position: "relative", width: markW, height: markH, overflow: "hidden", marginLeft: -6 }}>
            <img
              src={wordmark}
              alt=""
              width={markImgW}
              height={Math.round((markImgW * 880) / 2240)}
              style={{ position: "absolute", left: -Math.round(markW * 0.353), top: -Math.round(markH * 0.328) }}
            />
          </div>

          <div style={{ display: "flex", marginTop: 36, fontSize: 62, lineHeight: 1.08, letterSpacing: -2 }}>
            {`${SITE_TAGLINE}.`}
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", marginTop: 20, fontSize: 26, lineHeight: 1.35, color: "rgba(42,29,36,0.66)" }}
          >
            <span>Ask them out with one link.</span>
            <span>Their answer lands in your Telegram.</span>
          </div>

          <div style={{ display: "flex", marginTop: 40, fontSize: 20, color: "rgba(42,29,36,0.5)", letterSpacing: 0.5 }}>
            {new URL(SITE_URL).host}
          </div>
        </div>

        {/* Love Letter, sealed behind and opened in front, then Kitten Soft in front of both. */}
        <Phone src={envelope} left={958} top={92} rotate={9} />
        <Phone src={letter} left={806} top={66} rotate={2} />
        <Phone src={kitten} left={626} top={104} rotate={-7} scale={FRONT_SCALE} />
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: geist, style: "normal", weight: 400 }] },
  );
}
