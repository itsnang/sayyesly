import Image from "next/image";
import type { CSSProperties } from "react";
import { isOptimizable } from "@/lib/media";
import type { Plan, PlanPhoto, Stop } from "../../types";
import { COLORS } from "./palette";
import {
  BinderClip,
  Bow,
  DoodleArrow,
  Dots,
  FilmStrip,
  FONT,
  GuestCheck,
  KraftNote,
  LabelStrip,
  MarkerWords,
  NoteTone,
  PageNumber,
  Polaroid,
  Ransom,
  Script,
  Stamp,
  Sticker,
  StickerKind,
  StickyNote,
  StreetSign,
  Ticket,
} from "./pieces";

// The Theme's own decorations, picked by position: the Creator never writes them.
const MARKER_WORDS = ["yum!", "busy doing nothing", "happier times are coming", "best day ever", "no regrets"];

/** The first Stop's page: after the cover and the contents. */
export const CHAPTER_PAGE = 2;

/** Room for the spiral's holes down the left of every page. */
const PAGE_PAD = "22px 16px 30px 32px";

/** Ransom letters shrink as the words get longer, so a title fits the page. */
const ransomSize = (text: string) => (text.length <= 10 ? 40 : text.length <= 18 ? 32 : 25);

const two = (n: number) => String(n).padStart(2, "0");

/** The cover: chipboard with the title in cut-out letters, who it's for in blue pen, and a collage. */
export function HardCover({ plan, recipientName }: { plan: Plan; recipientName: string }) {
  const [first, second] = plan.stops.flatMap((s) => s.photos.slice(0, 1));
  const title = plan.title || "our day";
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", padding: "34px 18px 22px 34px", overflow: "hidden" }}>
      <span style={{ position: "absolute", right: 18, top: 16, fontFamily: FONT.typed, fontSize: 11, letterSpacing: 1, color: COLORS.coverEdge }}>NO. 01</span>
      <h2 style={{ margin: "20px 30px 0 0" }}>
        <Ransom text={title} size={ransomSize(title)} />
      </h2>
      <Script size={40} style={{ marginTop: 16 }}>
        for {recipientName.trim() || "you"}
      </Script>
      <Sticker kind={StickerKind.Butterfly} size={46} style={{ right: 20, top: 46 }} />

      {/* the collage fills what's left of the cover */}
      <div style={{ position: "relative", flex: 1, minHeight: 280, marginTop: 10 }}>
        {first && (
          <div style={{ position: "absolute", left: 0, top: "8%" }}>
            <BinderClip style={{ top: -30, left: 62 }} />
            <Polaroid src={first.url} alt={first.alt} width={168} rotate={-4} tape={false} />
          </div>
        )}
        {second && <Stamp src={second.url} alt={second.alt} width={100} label="POSTA" rotate={7} style={{ position: "absolute", right: 4, top: "2%" }} />}
        {plan.stops.length > 0 && (
          <Ticket rotate={6} style={{ position: "absolute", right: 0, bottom: "12%" }}>
            admit two
            <br />
            {plan.stops.length} {plan.stops.length === 1 ? "chapter" : "chapters"}
          </Ticket>
        )}
        <Bow size={50} style={{ left: 150, top: "48%" }} />
        <Dots style={{ left: -14, bottom: 0 }} />
      </div>
    </div>
  );
}

/** A photo-booth strip: a few photos in a column on white. */
function BoothStrip({ photos, style }: { photos: PlanPhoto[]; style?: CSSProperties }) {
  return (
    <div style={{ width: 84, padding: "6px 6px 14px", background: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,.18)", transform: "rotate(4deg)", display: "flex", flexDirection: "column", gap: 5, ...style }}>
      {photos.map((p, i) => (
        <div key={i} style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", overflow: "hidden", background: "#e8e4dc" }}>
          {/* Decorative next to the plan; the same photos are on the chapters with their alt text. */}
          <Image src={p.url} unoptimized={!isOptimizable(p.url)} alt="" fill sizes="72px" draggable={false} style={{ objectFit: "cover", filter: "grayscale(.35)" }} />
        </div>
      ))}
    </div>
  );
}

/** Dress code and notes, on a sticky note. */
export function PlanNotes({ plan, style }: { plan: Plan; style?: CSSProperties }) {
  if (!plan.dressCode && !plan.notes) return null;
  return (
    <StickyNote tone={NoteTone.Mint} rotate={-3} style={style}>
      {plan.dressCode && <div>wear: {plan.dressCode}</div>}
      {plan.notes && <div style={{ marginTop: plan.dressCode ? 4 : 0 }}>note: {plan.notes}</div>}
    </StickyNote>
  );
}

/** The plan as a guest check: one line per Stop, turning to its page, or with its map once answered. */
export function PlanCheck({ plan, goTo, withMaps = false, style }: { plan: Plan; goTo?: (page: number) => void; withMaps?: boolean; style?: CSSProperties }) {
  return (
    <GuestCheck
      heading={plan.title || "our day"}
      style={style}
      total={<>total: one whole day ♡</>}
      rows={plan.stops.map((s, i) => ({
        no: two(i + 1),
        item: (
          <>
            {s.title}
            {s.time && <span style={{ color: COLORS.soft }}> · {s.time}</span>}
            {withMaps && s.mapUrl && (
              <>
                {" · "}
                <a href={s.mapUrl} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.blue }}>
                  map
                </a>
              </>
            )}
          </>
        ),
        side: goTo ? `p.${i + CHAPTER_PAGE}` : "✓",
        ...(goTo ? { onClick: () => goTo(i + CHAPTER_PAGE) } : {}),
      }))}
    />
  );
}

/** Inside the cover: the plan as a guest check, the notes on a sticky note, and a photo-booth strip. */
export function Contents({ plan, goTo }: { plan: Plan; goTo: (page: number) => void }) {
  const photos = plan.stops.flatMap((s) => s.photos.slice(0, 1)).slice(0, 3);
  return (
    <div style={{ position: "relative", padding: PAGE_PAD }}>
      <Script size={50}>the plan</Script>
      <Bow size={52} style={{ right: 18, top: 10 }} />
      <PlanCheck plan={plan} goTo={goTo} style={{ marginTop: 18 }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginTop: 22 }}>
        <PlanNotes plan={plan} style={{ flex: 1, maxWidth: 190 }} />
        {photos.length > 0 && <BoothStrip photos={photos} style={{ marginLeft: "auto" }} />}
      </div>
      <Dots style={{ left: 40, bottom: 40 }} />
      <PageNumber n={1} />
    </div>
  );
}

/** One Stop as a journal page: its time, its name in cut-out letters, what you'll do, its photos, its line, and where. */
export function Chapter({ stop, n }: { stop: Stop; n: number }) {
  const photos = stop.photos.slice(0, 3);
  const [only] = photos;
  return (
    <div style={{ position: "relative", padding: PAGE_PAD }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <LabelStrip>chapter {two(n)}</LabelStrip>
        {stop.time && (
          <span style={{ fontFamily: FONT.hand, fontSize: 21, color: COLORS.ink }}>
            <b style={{ fontFamily: FONT.typed, fontSize: 12 }}>Time:</b> {stop.time}
          </span>
        )}
      </div>

      <h2 style={{ margin: "18px 0 0" }}>
        <Ransom text={stop.title} size={ransomSize(stop.title)} />
      </h2>

      <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "flex-start" }}>
        <p style={{ flex: 1, margin: 0, fontFamily: FONT.note, fontSize: 15, lineHeight: 1.75, color: COLORS.ink, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
          {stop.description}
        </p>
        {photos.length > 1 && <FilmStrip photos={photos} label={`${two(n)}/${two(photos.length)}`} width={124} rotate={3} style={{ flexShrink: 0 }} />}
        {photos.length === 1 && only && (
          <div style={{ position: "relative", flexShrink: 0, marginTop: 14 }}>
            <BinderClip style={{ top: -30, left: 46 }} />
            <Polaroid src={only.url} alt={only.alt} caption={only.caption} width={136} rotate={3} tape={false} />
          </div>
        )}
      </div>

      {stop.line && (
        <KraftNote rotate={-3} style={{ marginTop: 18, maxWidth: 230 }}>
          {stop.line}
        </KraftNote>
      )}

      <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 26, minHeight: 70 }}>
        {stop.place || stop.mapUrl ? <StreetSign lines={stop.place ? [stop.place] : []} mapUrl={stop.mapUrl} /> : <span />}
        <MarkerWords rotate={-6} style={{ position: "static", maxWidth: 120, textAlign: "right" }}>
          {MARKER_WORDS[(n - 1) % MARKER_WORDS.length]}
        </MarkerWords>
        {(stop.place || stop.mapUrl) && <DoodleArrow style={{ right: 116, top: -58 }} />}
      </div>
      {n % 2 ? <Sticker kind={StickerKind.Star} size={34} style={{ right: 14, top: 58 }} /> : <Dots style={{ right: 14, top: 56 }} />}
      <PageNumber n={n + CHAPTER_PAGE - 1} />
    </div>
  );
}
