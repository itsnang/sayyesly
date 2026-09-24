import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OG_IMAGE_SIZE, type OgImageInput } from "../types";

const PAGE = "#f8f6f0";
const INK = "#2637c4";
const GRAPHITE = "#8d8a83";

/** Love Letter's link preview: the question handwritten on a diary page. Never shows the Recipient's name. */
export async function renderLoveLetterOgImage({ question }: OgImageInput) {
  const [marker, print] = await Promise.all([
    readFile(join(process.cwd(), "assets/Mansalva-Regular.ttf")),
    readFile(join(process.cwd(), "assets/Geist-Regular.ttf")),
  ]);
  const length = question.reduce((n, s) => n + s.text.length, 0);
  const fontSize = length > 36 ? 70 : length > 24 ? 84 : 100;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", background: PAGE, padding: "44px 56px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Geist", fontSize: 16, letterSpacing: 3, color: GRAPHITE, textTransform: "uppercase" }}>
          <span>sayyesly</span>
          <span>a letter for you</span>
        </div>

        <svg width="92" height="92" viewBox="0 0 64 64" style={{ position: "absolute", left: 70, top: 110 }}>
          <circle cx="32" cy="33" r="11" fill="#f4c54a" />
          <path d="M32 6v9M32 51v8M6 33h9M50 33h8M13 13l6 6M45 46l6 6M13 53l6-6M46 19l5-5" stroke={GRAPHITE} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
        <svg width="34" height="34" viewBox="0 0 24 24" style={{ position: "absolute", right: 150, top: 132 }}>
          <path d="M12 2.5l2.6 6.1 6.6.5-5 4.3 1.6 6.5L12 16.4l-5.8 3.5 1.6-6.5-5-4.3 6.6-.5z" fill="#b8d0f0" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        </svg>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            padding: "0 90px",
            fontFamily: "Mansalva",
            fontSize,
            lineHeight: 1.32,
            color: INK,
            textAlign: "center",
          }}
        >
          {question.flatMap((segment, i) =>
            segment.emphasis
              ? [
                  <div key={i} style={{ display: "flex", position: "relative", padding: "0 10px", margin: "0 8px" }}>
                    {segment.text.trim()}
                    <svg
                      viewBox="0 0 200 60"
                      preserveAspectRatio="none"
                      style={{ position: "absolute", left: "-9%", top: "-14%", width: "118%", height: "128%" }}
                    >
                      <path d="M30 9C80-2 162 1 190 19c16 12-6 33-72 37C58 60 7 50 6 30 5 17 26 8 64 5" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                  </div>,
                ]
              : segment.text
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((word, j) => (
                    <span key={`${i}-${j}`} style={{ margin: "0 12px" }}>
                      {word}
                    </span>
                  )),
          )}
        </div>

        <svg width="260" height="60" viewBox="0 0 170 40" style={{ alignSelf: "center" }}>
          <path d="M4 38c30-2 130-2 162 0" stroke={GRAPHITE} strokeWidth="1.1" fill="none" />
          {["#b8d0f0", "#f3a9b9", "#f4c54a", "#f3a9b9", "#b8d0f0"].map((color, i) => {
            const x = 20 + i * 32;
            const top = 10 + (i % 2) * 5;
            return (
              <g key={i}>
                <path d={`M${x} 37C${x - 1} 30 ${x + 1} 22 ${x} ${top + 5}`} stroke="#6f8f55" strokeWidth="1.1" fill="none" />
                <circle cx={x} cy={top} r="5.5" fill={color} stroke={INK} strokeWidth="1" />
                <circle cx={x} cy={top} r="1.3" fill={INK} />
              </g>
            );
          })}
        </svg>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        { name: "Mansalva", data: marker, style: "normal", weight: 400 },
        { name: "Geist", data: print, style: "normal", weight: 400 },
      ],
    },
  );
}
