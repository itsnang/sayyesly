import type { CSSProperties } from "react";
import type { Plan, Stop } from "../../types";
import { GRAIN } from "../shared/paper";
import { COLORS } from "./palette";
import { FONT, LabelStrip, MarkerWords, PaperClip, Polaroid, ScriptCard, Sticker, StickerKind, Tape, TypedCard, type TapeTone } from "./pieces";

// The Theme's own decorations, picked by position: the Creator never writes them.
const MARKER_WORDS = ["yum!", "busy doing nothing", "happier times are coming", "best day ever", "no regrets"];
const TILTS = [3, -4, 2];
const TAPES: TapeTone[] = ["beige", "grid", "sage"];

/** What the sage card says: the handwritten line, else the title. */
const scriptLine = (stop: Stop) => stop.line || stop.title;

/** The hard cover: a cloth binder with a notebook label saying what's inside and who it's for. */
export function HardCover({ plan, recipientName }: { plan: Plan; recipientName: string }) {
  const [first, second] = plan.stops.flatMap((s) => s.photos.slice(0, 1));
  const line: CSSProperties = { display: "flex", alignItems: "baseline", gap: 8, borderBottom: `1px solid rgba(138,98,64,.35)`, padding: "2px 0 1px" };
  const field: CSSProperties = { fontFamily: FONT.typed, fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: COLORS.soft, flexShrink: 0 };
  return (
    <div style={{ position: "relative", height: "100%", padding: "74px 26px 30px" }}>
      {/* blind-stamped into the cloth */}
      <div style={{ fontFamily: FONT.typed, fontSize: 11, letterSpacing: 4, textAlign: "center", color: COLORS.clothEdge, textShadow: "0 1px 0 rgba(255,255,255,.22)" }}>
        VOL. 01 · A DAY OUT
      </div>

      {first && <Polaroid src={first.url} alt={first.alt} width={124} rotate={7} tape="sage" style={{ position: "absolute", right: 24, bottom: 46, zIndex: 1 }} />}
      {second && <Polaroid src={second.url} alt={second.alt} width={104} rotate={-6} tape="beige" style={{ position: "absolute", left: 30, bottom: 96, zIndex: 1 }} />}

      <div
        style={{
          position: "relative",
          zIndex: 2,
          margin: "26px auto 0",
          padding: "14px 18px 16px",
          background: `${GRAIN}, #f8f1e3`,
          borderRadius: 10,
          boxShadow: `inset 0 0 0 4px #f8f1e3, inset 0 0 0 5.5px ${COLORS.brown}, inset 0 0 0 7px #f8f1e3, inset 0 0 0 8px ${COLORS.brown}, 0 2px 5px rgba(0,0,0,.25)`,
          transform: "rotate(-1.2deg)",
        }}
      >
        <div style={line}>
          <span style={field}>title</span>
        </div>
        <div style={{ fontFamily: FONT.hand, fontSize: 42, fontWeight: 700, lineHeight: 1, color: COLORS.ink, padding: "4px 0 6px", borderBottom: `1px solid rgba(138,98,64,.35)`, overflowWrap: "anywhere" }}>
          {plan.title || "our day"}
        </div>
        <div style={line}>
          <span style={field}>for</span>
          <span style={{ fontFamily: FONT.hand, fontSize: 26, color: COLORS.ink }}>{recipientName.trim() || "you"}</span>
        </div>
        {plan.stops.length > 0 && (
          <div style={line}>
            <span style={field}>inside</span>
            <span style={{ fontFamily: FONT.hand, fontSize: 26, color: COLORS.ink }}>
              {plan.stops.length} {plan.stops.length === 1 ? "chapter" : "chapters"}
            </span>
          </div>
        )}
      </div>

      <Sticker kind={StickerKind.Sun} size={52} style={{ left: 16, top: 40 }} />
      <Sticker kind={StickerKind.Star} size={40} style={{ left: 150, bottom: 70 }} />
      <Sticker kind={StickerKind.Heart} size={34} style={{ left: 24, bottom: 40 }} />
    </div>
  );
}

/** Inside the cover: the plan as a contents page, each Stop a line to turn to, and a taped collage. */
export function Contents({ plan, goTo }: { plan: Plan; goTo: (page: number) => void }) {
  const photos = plan.stops.flatMap((s) => s.photos.slice(0, 1)).slice(0, 3);
  return (
    <div style={{ position: "relative", padding: "26px 22px 34px" }}>
      <LabelStrip>contents</LabelStrip>
      <h2 style={{ fontFamily: FONT.hand, fontSize: 46, fontWeight: 700, lineHeight: 1, color: COLORS.ink, margin: "8px 0 4px" }}>the plan</h2>
      <Squiggle width={120} />
      <ol style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
        {plan.stops.map((s, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => goTo(i + CHAPTER_PAGE)}
              style={{ display: "flex", alignItems: "baseline", width: "100%", gap: 6, padding: "7px 0", border: 0, background: "none", cursor: "pointer", fontFamily: FONT.typed, fontSize: 13, color: COLORS.ink, textAlign: "left" }}
            >
              <span style={{ fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ textTransform: "lowercase", overflowWrap: "anywhere" }}>
                {s.title}
                {s.time && <span style={{ color: COLORS.soft }}> · {s.time}</span>}
              </span>
              <span aria-hidden="true" style={{ flex: 1, minWidth: 16, borderBottom: `2px dotted ${COLORS.soft}`, transform: "translateY(-4px)" }} />
              <span style={{ fontFamily: FONT.hand, fontSize: 20 }}>p.{i + CHAPTER_PAGE}</span>
            </button>
          </li>
        ))}
      </ol>
      {(plan.dressCode || plan.notes) && (
        <div style={{ position: "relative", margin: "16px 40px 0 8px", padding: "16px 14px 12px", background: "#f6e3c4", boxShadow: "0 3px 6px rgba(0,0,0,.14)", transform: "rotate(-2deg)", fontFamily: FONT.note, fontSize: 14, color: COLORS.ink }}>
          <Tape tone="grid" width={60} style={{ top: -9, left: "50%", marginLeft: -30 }} />
          {plan.dressCode && <div>wear: {plan.dressCode}</div>}
          {plan.notes && <div style={{ marginTop: plan.dressCode ? 4 : 0 }}>note: {plan.notes}</div>}
        </div>
      )}
      {photos.length > 0 && (
        <div style={{ position: "relative", height: 250, marginTop: 18 }}>
          {photos.map((p, i) => (
            <Polaroid
              key={i}
              src={p.url}
              alt={p.alt}
              width={110}
              rotate={[-6, 5, -2][i] ?? 0}
              tape={TAPES[i] ?? "beige"}
              style={{ position: "absolute", left: ["2%", "56%", "30%"][i], top: [30, 0, 110][i] }}
            />
          ))}
        </div>
      )}
      <PageNumber n={1} />
    </div>
  );
}

/** The first Stop's page: after the cover and the contents. */
export const CHAPTER_PAGE = 2;

/** A hand-drawn wavy underline. */
function Squiggle({ width }: { width: number }) {
  return (
    <svg width={width} height="10" viewBox="0 0 120 10" aria-hidden="true" style={{ display: "block" }}>
      <path d="M2 6c10-6 18 4 28 0s18-6 28 0 18 4 28 0 18-6 30-1" fill="none" stroke={COLORS.sage} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** A handwritten page number at the foot of the page. */
export function PageNumber({ n }: { n: number }) {
  return <div style={{ marginTop: 26, textAlign: "center", fontFamily: FONT.hand, fontSize: 18, color: COLORS.soft }}>— {n} —</div>;
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
    <div style={{ position: "relative", padding: "26px 18px 34px" }}>
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
      <PageNumber n={n + CHAPTER_PAGE - 1} />
    </div>
  );
}
