import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_TITLE } from "@/lib/site";
import { OG_IMAGE_SIZE, type OgImageInput } from "../types";
import { COLORS } from "./palette";

const { paper: PAPER, board: BOARD, blue: BLUE, soft: SOFT, sage: SAGE } = COLORS;

const sizeFor = (text: string) => (text.length > 40 ? 72 : text.length > 24 ? 88 : 104);

/** Binder's link preview: the question in blue pen on a notebook page on a spiral, its emphasised words cut out. Never shows the Recipient's name. */
export async function renderBinderOgImage({ question }: OgImageInput) {
  const [hand, note] = await Promise.all([
    readFile(join(process.cwd(), "assets/Caveat-Bold.ttf")),
    readFile(join(process.cwd(), "assets/ArchitectsDaughter-Regular.ttf")),
  ]);
  const fontSize = sizeFor(question.map((s) => s.text).join(""));
  // One coil every 30px down the page's left edge.
  const coil = (y: number) => (
    <div key={y} style={{ position: "absolute", left: 52, top: y, width: 50, height: 16, borderRadius: 8, border: "4px solid #a9a9a9", display: "flex" }} />
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: BOARD, padding: "44px 70px 36px" }}>
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: PAPER,
            borderRadius: "4px 18px 18px 4px",
            boxShadow: "0 6px 18px rgba(0,0,0,.18)",
            padding: "56px 70px 36px 90px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "ArchitectsDaughter", fontSize: 22, color: SOFT }}>
            <span style={{ background: "#1d1b19", color: "#f4f1ea", padding: "4px 12px", fontSize: 18 }}>{SITE_TITLE}</span>
            <span>a plan for you ✦</span>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              alignContent: "center",
              justifyContent: "center",
              fontFamily: "Caveat",
              fontSize,
              lineHeight: 1.1,
              color: BLUE,
              textAlign: "center",
            }}
          >
            {question.flatMap((segment, i) =>
              segment.text
                .split(/\s+/)
                .filter(Boolean)
                .map((word, j) => (
                  <span
                    key={`${i}-${j}`}
                    style={{ margin: "0 10px", padding: "0 8px", background: segment.emphasis ? SAGE : "transparent", color: segment.emphasis ? "#1f1c1a" : BLUE }}
                  >
                    {word}
                  </span>
                )),
            )}
          </div>
        </div>
        {Array.from({ length: 18 }, (_, i) => coil(64 + i * 30))}
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        { name: "Caveat", data: hand, style: "normal", weight: 700 },
        { name: "ArchitectsDaughter", data: note, style: "normal", weight: 400 },
      ],
    },
  );
}
