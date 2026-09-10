import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "will you have dinner with me?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Matches the graph-paper ground in app/globals.css
const GRID = 26;
const GRID_LINE = "rgba(180,60,110,0.09)";
const PAPER = "#fff5f8";
const INK = "#5e2446";
const INK_SOFT = "#9c5c7e";
const ACCENT = "#e23a7a";

export default async function Image() {
  const [caveat, architectsDaughter, cat] = await Promise.all([
    readFile(join(process.cwd(), "assets/Caveat-Bold.ttf")),
    readFile(join(process.cwd(), "assets/ArchitectsDaughter-Regular.ttf")),
    readFile(join(process.cwd(), "public/cat-nobg.png"), "base64"),
  ]);

  const verticals = Array.from(
    { length: Math.ceil(size.width / GRID) },
    (_, i) => i * GRID,
  );
  const horizontals = Array.from(
    { length: Math.ceil(size.height / GRID) },
    (_, i) => i * GRID,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: PAPER,
        }}
      >
        {verticals.map((x) => (
          <div
            key={`v${x}`}
            style={{
              position: "absolute",
              left: x,
              top: 0,
              width: 1,
              height: size.height,
              background: GRID_LINE,
            }}
          />
        ))}
        {horizontals.map((y) => (
          <div
            key={`h${y}`}
            style={{
              position: "absolute",
              left: 0,
              top: y,
              width: size.width,
              height: 1,
              background: GRID_LINE,
            }}
          />
        ))}

        {/* Warm wash, echoing the radial tints on the live page */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, #ffe0ec 0%, rgba(255,224,236,0) 48%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: "100%",
            padding: "0 76px",
          }}
        >
          <img
            src={`data:image/png;base64,${cat}`}
            alt=""
            width={356}
            height={365}
            style={{ marginRight: 64 }}
          />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Caveat", fontSize: 82, color: INK, lineHeight: 1 }}>
              will you have
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", marginTop: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", marginRight: 18 }}>
                <div
                  style={{
                    fontFamily: "Caveat",
                    fontSize: 96,
                    color: ACCENT,
                    lineHeight: 1,
                  }}
                >
                  dinner
                </div>
                <svg
                  width={222}
                  height={13}
                  viewBox="0 0 120 16"
                  preserveAspectRatio="none"
                  style={{ marginTop: 1, marginLeft: -6 }}
                >
                  <path
                    d="M3 9 C30 15 60 3 90 9 C103 12 112 10 117 7"
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div
                style={{
                  fontFamily: "Caveat",
                  fontSize: 96,
                  color: INK,
                  lineHeight: 1,
                }}
              >
                with me?
              </div>
            </div>

            <div
              style={{
                fontFamily: "Architects Daughter",
                fontSize: 25,
                color: INK_SOFT,
                marginTop: 46,
              }}
            >
              {"// two buttons. one of them runs away."}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Caveat", data: caveat, style: "normal", weight: 700 },
        {
          name: "Architects Daughter",
          data: architectsDaughter,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
