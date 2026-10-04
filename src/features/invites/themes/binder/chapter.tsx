import type { Plan, Stop } from "../../types";
import { COLORS } from "./palette";
import { CardTone, FONT, LabelStrip, MarkerWords, PaperClip, Polaroid, ScriptCard, Sticker, StickerKind, TypedCard, type TapeTone } from "./pieces";

// The Theme's own decorations, picked by position: the Creator never writes them.
const MARKER_WORDS = ["yum!", "busy doing nothing", "happier times are coming", "best day ever", "no regrets"];
const TILTS = [3, -4, 2];
const TAPES: TapeTone[] = ["beige", "grid", "sage"];

/** What the sage card says: the handwritten line, else the title. */
const scriptLine = (stop: Stop) => stop.line || stop.title;

/** The cover: the Plan's title, who it's for, the plan as a typed card, and a taped collage. */
export function Cover({ plan, recipientName }: { plan: Plan; recipientName: string }) {
  const photos = plan.stops.flatMap((s) => s.photos.slice(0, 1)).slice(0, 3);
  return (
    <div style={{ position: "relative", padding: "34px 24px 30px" }}>
      <h2 style={{ fontFamily: FONT.hand, fontSize: 48, fontWeight: 700, lineHeight: 0.9, color: COLORS.ink, maxWidth: 230, margin: 0, overflowWrap: "anywhere" }}>
        {plan.title || "our day"}
      </h2>
      <LabelStrip style={{ marginTop: 10 }}>for {recipientName.trim() || "you"}</LabelStrip>
      {(plan.stops.length > 0 || plan.dressCode || plan.notes) && (
        <TypedCard tone={CardTone.Cream} rotate={1.5} style={{ margin: "18px 64px 0 0" }}>
          <PlanList plan={plan} heading="the plan" />
        </TypedCard>
      )}
      <MarkerWords style={{ right: 20, top: 104, maxWidth: 92 }}>swipe ← to open</MarkerWords>
      <Sticker kind={StickerKind.Sun} size={44} style={{ right: 24, top: 36 }} />
      {photos.length > 0 && (
        <div style={{ position: "relative", height: 280, marginTop: 22 }}>
          {photos.map((p, i) => (
            <Polaroid
              key={i}
              src={p.url}
              alt={p.alt}
              width={112}
              rotate={[-6, 5, -2][i] ?? 0}
              tape={TAPES[i] ?? "beige"}
              style={{ position: "absolute", left: ["2%", "56%", "34%"][i], top: [40, 0, 130][i] }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** The plan as typed lines: each Stop and its time (with a map link when asked), then dress code and notes. */
export function PlanList({ plan, heading, withMaps = false }: { plan: Plan; heading: string; withMaps?: boolean }) {
  return (
    <>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{heading}:</div>
      {plan.stops.map((s, i) => (
        <div key={i}>
          {i + 1}. {s.title.toLowerCase()}
          {s.time && ` · ${s.time}`}
          {withMaps && s.mapUrl && (
            <>
              {" · "}
              <a href={s.mapUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
                map
              </a>
            </>
          )}
        </div>
      ))}
      {plan.dressCode && <div style={{ marginTop: plan.stops.length ? 6 : 0 }}>wear: {plan.dressCode}</div>}
      {plan.notes && <div style={{ marginTop: plan.stops.length && !plan.dressCode ? 6 : 0 }}>note: {plan.notes}</div>}
    </>
  );
}

/** One Stop as a scrapbook spread: label strip, clipped polaroid, script card, typed card, map, more photos. */
export function Chapter({ stop, n }: { stop: Stop; n: number }) {
  const [first, ...rest] = stop.photos;
  return (
    <div style={{ position: "relative", padding: "30px 18px 34px" }}>
      <LabelStrip>
        chapter {String(n).padStart(2, "0")}
        {stop.time && ` · ${stop.time}`}
      </LabelStrip>

      <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "flex-start" }}>
        {first && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <PaperClip style={{ top: -14, left: 18 }} />
            <Polaroid src={first.url} alt={first.alt} caption={first.caption} width={136} rotate={-3} tape={false} />
          </div>
        )}
        <ScriptCard rotate={3} style={{ flex: 1, marginTop: first ? 24 : 6, minHeight: 110 }}>
          {scriptLine(stop)}
        </ScriptCard>
      </div>

      <TypedCard rotate={-1.5} style={{ margin: "-6px 8px 0 36px", zIndex: 2 }}>
        <div style={{ fontWeight: 700, textTransform: "lowercase" }}>{stop.title}.</div>
        {stop.description && <div style={{ marginTop: 4, whiteSpace: "pre-line" }}>{stop.description}</div>}
      </TypedCard>

      {(stop.place || stop.mapUrl) && (
        <p style={{ fontFamily: FONT.note, fontSize: 14, color: COLORS.ink, margin: "16px 0 0" }}>
          → {stop.place ?? "here"}{" "}
          {stop.mapUrl && (
            <a href={stop.mapUrl} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.ink }}>
              (open the map)
            </a>
          )}
        </p>
      )}

      <div style={{ position: "relative", display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16, minHeight: rest.length ? undefined : 60 }}>
        {rest.map((p, i) => (
          <Polaroid key={i} src={p.url} alt={p.alt} caption={p.caption} width={rest.length > 1 ? 104 : 128} rotate={TILTS[i] ?? 0} tape={i % 2 ? "grid" : "beige"} />
        ))}
        <MarkerWords style={{ left: 0, bottom: 30, maxWidth: 120 }}>{MARKER_WORDS[(n - 1) % MARKER_WORDS.length]}</MarkerWords>
      </div>
    </div>
  );
}
