// PROTOTYPE: one Stop as a scrapbook spread in the binder image's style (not the PDF's
// look): a label strip, a coloured script card, a typed kraft card, clipped polaroids,
// pen notes and marker words.
import type { ExampleStop } from "./example";
import { C, FONT, LabelStrip, MarkerWords, PaperClip, Polaroid, ScriptCard, TypedCard } from "./pieces";

const MARKER = ["yum!", "busy doing nothing", "happier times are coming"];

export function Chapter({ stop, n }: { stop: ExampleStop; n: number }) {
  const [first, ...rest] = stop.photos;
  return (
    <div style={{ position: "relative", padding: "22px 18px 30px 34px", minHeight: 540 }}>
      <LabelStrip>chapter 0{n} · {stop.time}</LabelStrip>

      <div style={{ position: "relative", display: "flex", gap: 10, marginTop: 16 }}>
        {first && (
          <div style={{ position: "relative" }}>
            <PaperClip style={{ top: -14, left: 18 }} />
            <Polaroid src={first.url} caption={first.caption} width={138} rotate={-3} tape={false} />
          </div>
        )}
        <ScriptCard rotate={3} style={{ flex: 1, marginTop: 24, minHeight: 120 }}>
          {stop.subtitle}
        </ScriptCard>
      </div>

      <TypedCard rotate={-1.5} style={{ margin: "-6px 8px 0 40px", zIndex: 2 }}>
        <div style={{ fontWeight: 700, textTransform: "lowercase", marginBottom: 4 }}>{stop.title}.</div>
        {stop.description}
      </TypedCard>

      <p style={{ fontFamily: FONT.note, fontSize: 14, color: C.ink, margin: "14px 0 0" }}>
        → {stop.place} <span style={{ textDecoration: "underline" }}>(map)</span>
      </p>

      <div style={{ position: "relative", display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
        {rest.map((photo, i) => (
          <Polaroid key={i} src={photo.url} caption={photo.caption} width={rest.length > 1 ? 104 : 128} rotate={i % 2 ? -4 : 3} tape={i % 2 ? "grid" : "beige"} />
        ))}
        <MarkerWords style={{ left: 0, bottom: 30, maxWidth: 110 }}>{MARKER[(n - 1) % MARKER.length]}</MarkerWords>
      </div>
    </div>
  );
}
