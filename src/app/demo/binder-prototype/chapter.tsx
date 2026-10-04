// PROTOTYPE: one Stop drawn as a handbook chapter (the PDF's structure, the binder's look).
import type { ExampleStop } from "./example";
import { C, FONT, Polaroid, Sticker, TimeTag } from "./pieces";

const TILTS = [-4, 3, -2];

export function Chapter({ stop, n }: { stop: ExampleStop; n: number }) {
  return (
    <div style={{ position: "relative", padding: "26px 22px 30px 34px" }}>
      <div style={{ fontFamily: FONT.display, fontSize: 40, lineHeight: 1, color: C.olive }}>Chapter {n}:</div>
      <div style={{ fontFamily: FONT.hand, fontSize: 34, color: C.rust, textAlign: "right", marginTop: -2, transform: "rotate(-3deg)" }}>
        {stop.subtitle}
      </div>
      <TimeTag style={{ marginTop: 6 }}>{stop.time}</TimeTag>
      <p style={{ fontFamily: FONT.note, fontSize: 14, lineHeight: 1.55, color: C.ink, margin: "12px 0 4px" }}>{stop.description}</p>
      <p style={{ fontFamily: FONT.hand, fontSize: 19, color: C.soft, margin: 0 }}>
        📍 {stop.place} · <span style={{ textDecoration: "underline" }}>open map</span>
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 18 }}>
        {stop.photos.map((photo, i) => (
          <Polaroid
            key={i}
            src={photo.url}
            caption={photo.caption}
            width={stop.photos.length > 2 ? 104 : 138}
            rotate={TILTS[i % TILTS.length] ?? 0}
            tape={i % 2 ? "sage" : "grid"}
            style={{ marginTop: i % 2 ? 14 : 0 }}
          />
        ))}
      </div>
      <Sticker kind={n === 3 ? "sun" : n === 2 ? "heart" : "star"} style={{ top: 18, right: 18 }} />
    </div>
  );
}
