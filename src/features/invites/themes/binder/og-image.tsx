import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_TITLE } from "@/lib/site";
import { OG_IMAGE_SIZE, type OgImageInput } from "../types";

const PAPER = "#fdfcf8";
const BOARD = "#cfc8c0";
const INK = "#2b2622";
const SOFT = "#7d726a";
const SAGE = "rgba(143,174,126,.55)";

const sizeFor = (text: string) => (text.length > 40 ? 72 : text.length > 24 ? 88 : 104);

/** Binder's link preview: the question handwritten on a grid-paper sheet under the rings. Never shows the Recipient's name. */
export async function renderBinderOgImage({ question }: OgImageInput) {
  const [hand, note] = await Promise.all([
    readFile(join(process.cwd(), "assets/Caveat-Bold.ttf")),
    readFile(join(process.cwd(), "assets/ArchitectsDaughter-Regular.ttf")),
  ]);
  const fontSize = sizeFor(question.map((s) => s.text).join(""));
  const grid =
    "linear-gradient(rgba(70,90,120,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(70,90,120,.09) 1px, transparent 1px)";
  const ring = (x: number) => (
    <div key={x} style={{ position: "absolute", left: x, top: 22, width: 22, height: 48, borderRadius: 11, border: "5px solid #a9a9a9", display: "flex" }} />
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
            backgroundImage: grid,
            backgroundSize: "22px 22px",
            boxShadow: "0 6px 18px rgba(0,0,0,.18)",
            padding: "70px 70px 36px",
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
              color: INK,
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
                    style={{ margin: "0 10px", padding: "0 4px", backgroundImage: segment.emphasis ? `linear-gradient(transparent 58%, ${SAGE} 58%)` : "none" }}
                  >
                    {word}
                  </span>
                )),
            )}
          </div>
        </div>
        {[180, 240, 300, 750, 810, 870].map(ring)}
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
