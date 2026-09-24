import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OG_IMAGE_SIZE } from "@/features/invites/themes";
import { SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

const CREAM = "#fff8f2";
const INK = "#2b1b22";
const MUTED = "#7c7069";

export default async function Image() {
  const wordmark = await readFile(join(process.cwd(), "public/brand/wordmark.png"), "base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: CREAM,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(60% 55% at 50% 40%, rgba(214,69,107,0.12) 0%, rgba(214,69,107,0) 70%)",
          }}
        />
        <img src={`data:image/png;base64,${wordmark}`} alt="" width={620} height={244} />
        <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: INK }}>Ask them to dinner.</div>
        <div style={{ display: "flex", marginTop: 10, fontSize: 22, color: MUTED }}>
          A tiny invite with a runaway &quot;no&quot; button.
        </div>
      </div>
    ),
    size,
  );
}
