"use client";

import { useState, type ReactNode } from "react";
import type { PublicInvite } from "../../types";
import { NOTE_MAX_LENGTH } from "../../utils/answer";
import type { PlanChoice } from "../shared/use-invite-answer";
import { isoDate, usePlanSelection } from "../shared/use-plan-selection";
import { customLabel, formatWhen, MONTHS, timeLabel } from "./format";
import { Arrow, FlowerRow, InkCircle, Leaf, PaperPlane, Photo, Star, Sun } from "./ornaments";

const WEEKDAYS = ["s", "m", "t", "w", "t", "f", "s"];
const TIMES = ["18:30", "19:00", "19:30", "20:00", "20:30"];
const PHOTO_TILTS = [-2.2, 1.8, -1.2];

type DiaryPageProps = {
  invite: PublicInvite;
  busy: boolean;
  error: string | null;
  onAccept: (choice: PlanChoice, note: string) => void;
  onNotThisTime: () => void;
};

/** The letter itself, laid out like a page from a diary. */
export function DiaryPage({ invite, busy, error, onAccept, onNotThisTime }: DiaryPageProps) {
  const { plan } = invite;
  const pick = usePlanSelection(invite);
  const { calendar, choice } = pick;
  const [otherTime, setOtherTime] = useState("");
  const [note, setNote] = useState("");
  const [openedAt] = useState(() => new Date());

  const chosen = pick.slot
    ? (() => {
        const w = formatWhen(pick.slot.startsAt, invite.timezone);
        return `${w.day} at ${w.time}`;
      })()
    : pick.date && pick.time
      ? customLabel(pick.date, pick.time)
      : null;

  const hasPlan = Boolean(plan.place || plan.activity || plan.mapUrl);

  return (
    <div style={{ background: "var(--ll-diary)", minHeight: "100svh" }}>
      <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", padding: "22px 22px 80px", animation: "ll-rise .7s ease-out both" }}>
        {/* Corner labels */}
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <Label>
            {plan.place}
            {plan.place && plan.activity && <br />}
            {plan.activity}
          </Label>
          <Label align="right">
            a letter for
            <br />
            {invite.recipientName}
          </Label>
        </header>

        {/* The question */}
        <section style={{ position: "relative", textAlign: "center", padding: "84px 6px 10px" }}>
          <Sun size={52} style={{ position: "absolute", left: 2, top: 14 }} />
          <Star size={20} style={{ position: "absolute", right: "16%", top: 46, transform: "rotate(12deg)" }} />
          <h1
            style={{
              position: "relative",
              fontFamily: "var(--ll-marker)",
              fontWeight: 400,
              fontSize: "clamp(40px, 11vw, 58px)",
              lineHeight: 1.12,
              color: "var(--ll-ink)",
              maxWidth: 480,
              margin: "0 auto",
              textWrap: "balance",
            }}
          >
            {invite.question.map((s, i) =>
              s.emphasis ? (
                <span key={i} style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
                  {s.text}
                  <InkCircle pad={6} />
                </span>
              ) : (
                s.text
              ),
            )}
          </h1>
          <Leaf size={24} style={{ position: "absolute", right: 10, bottom: -26, transform: "rotate(18deg)" }} />
        </section>

        {/* Photo and letter */}
        {(invite.imageUrl || invite.message) && (
          <section className="ll-split" style={{ marginTop: 48 }}>
            {invite.imageUrl && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Photo src={invite.imageUrl} alt="" width="min(300px, 88%)" tilt={-1.6} sizes="300px" priority />
              </div>
            )}
            {invite.message && (
              <div style={{ padding: "0 4px" }}>
                <Label>
                  opened {openedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase()} ·{" "}
                  {openedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase()}
                </Label>
                <p style={{ ...penText, marginTop: 10 }}>dear {invite.recipientName},</p>
                <p style={{ ...penText, marginTop: 4, whiteSpace: "pre-line" }}>{invite.message}</p>
              </div>
            )}
          </section>
        )}

        {/* The plan */}
        {(hasPlan || plan.photos.length > 0) && (
          <section style={{ position: "relative", marginTop: 56, textAlign: "center" }}>
            <PaperPlane size={72} style={{ position: "absolute", left: 0, top: -22, transform: "rotate(10deg)" }} />
            <Label align="center">the plan</Label>
            {plan.place && (
              <p style={{ marginTop: 16 }}>
                <span
                  style={{
                    position: "relative",
                    display: "inline-block",
                    fontFamily: "var(--ll-marker)",
                    fontSize: "clamp(34px, 9vw, 46px)",
                    lineHeight: 1.1,
                    color: "var(--ll-ink)",
                  }}
                >
                  {plan.place}
                  <InkCircle draw={false} pad={12} />
                </span>
              </p>
            )}
            {plan.activity && <p style={{ ...penText, marginTop: plan.place ? 18 : 12 }}>{plan.activity}</p>}
            {plan.mapUrl && (
              <a href={plan.mapUrl} target="_blank" rel="noopener noreferrer" style={{ ...penText, display: "inline-block", marginTop: 6, textUnderlineOffset: 4 }}>
                → find it on the map
              </a>
            )}

            {plan.photos.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "30px 18px", marginTop: 34 }}>
                {plan.photos.map((p, i) => (
                  <figure key={p.url} style={{ width: "min(46%, 220px)", margin: 0 }}>
                    <Photo src={p.url} alt={p.alt} width="100%" tilt={PHOTO_TILTS[i % PHOTO_TILTS.length] ?? 0} tape={i % 2 === 0} sizes="220px" />
                    {p.caption && (
                      <figcaption style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 2, marginTop: 8 }}>
                        <Arrow width={26} style={{ transform: "rotate(-120deg) scaleY(-1)", marginTop: -2 }} />
                        <span style={{ ...penText, fontSize: 22 }}>{p.caption}</span>
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </section>
        )}

        {/* NOTE! */}
        {(plan.dressCode || plan.notes) && (
          <section
            style={{
              marginTop: 50,
              padding: "20px 22px",
              background: "rgba(255,255,255,.62)",
              boxShadow: "0 0 18px 10px rgba(255,255,255,.62)",
              transform: "rotate(-.6deg)",
            }}
          >
            <p style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "var(--ll-marker)", fontSize: 30, color: "var(--ll-ink)" }}>NOTE!</span>
              <Label>(read me)</Label>
            </p>
            {plan.dressCode && <p style={{ ...penText, marginTop: 8 }}>★ wear: {plan.dressCode}</p>}
            {plan.notes && <p style={{ ...penText, marginTop: 6, whiteSpace: "pre-line" }}>★ {plan.notes}</p>}
          </section>
        )}

        <div style={{ display: "flex", justifyContent: "center", margin: "46px 0 30px" }}>
          <FlowerRow width={180} />
        </div>

        {/* When */}
        <section style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--ll-marker)", fontWeight: 400, fontSize: 34, color: "var(--ll-ink)" }}>when works for you?</h2>

          {invite.timeSlots.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, marginTop: 22 }}>
              {invite.timeSlots.map((s) => {
                const w = formatWhen(s.startsAt, invite.timezone);
                return (
                  <Option key={s.id} selected={pick.slotId === s.id} onClick={() => pick.pickSlot(s.id)}>
                    {w.day} · {w.time}
                  </Option>
                );
              })}
            </div>
          )}

          {invite.allowCustomTime && (
            <>
              {invite.timeSlots.length > 0 && <p style={{ ...penText, color: "var(--ll-graphite)", marginTop: 28 }}>or another day:</p>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 18 }}>
                <MonthArrow label="previous month" enabled={calendar.canGoBack} onClick={() => calendar.page(-1)}>
                  ‹
                </MonthArrow>
                <span style={{ ...penText, fontSize: 28, minWidth: 170 }}>
                  {MONTHS[calendar.month]?.toLowerCase()} {calendar.year}
                </span>
                <MonthArrow label="next month" enabled={calendar.canGoForward} onClick={() => calendar.page(1)}>
                  ›
                </MonthArrow>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 6, maxWidth: 330, margin: "8px auto 0" }}>
                {WEEKDAYS.map((d, i) => (
                  <Label key={i} align="center">
                    {d}
                  </Label>
                ))}
                {calendar.cells.map((day, i) => {
                  if (day === null) return <span key={`e${i}`} />;
                  const iso = isoDate(calendar.year, calendar.month, day);
                  const past = iso < calendar.todayIso;
                  const selected = pick.date === iso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={past}
                      aria-pressed={selected}
                      aria-label={`${MONTHS[calendar.month]} ${day}`}
                      onClick={() => pick.pickDate(iso)}
                      style={{
                        position: "relative",
                        height: 40,
                        border: "none",
                        background: "none",
                        fontFamily: "var(--ll-pen)",
                        fontSize: 25,
                        color: past ? "var(--ll-faint)" : "var(--ll-ink)",
                        cursor: past ? "default" : "pointer",
                        textDecoration: iso === calendar.todayIso ? "underline" : undefined,
                        textUnderlineOffset: 4,
                      }}
                    >
                      {day}
                      {selected && <InkCircle pad={2} />}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px 24px", marginTop: 26 }}>
                {TIMES.map((t) => (
                  <Option
                    key={t}
                    selected={!pick.slotId && pick.time === t}
                    onClick={() => {
                      setOtherTime("");
                      pick.pickTime(t);
                    }}
                  >
                    {timeLabel(t)}
                  </Option>
                ))}
              </div>
              <label style={{ ...penText, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18, color: "var(--ll-graphite)" }}>
                or another time
                <input
                  type="time"
                  value={otherTime}
                  onChange={(e) => {
                    setOtherTime(e.target.value);
                    pick.pickTime(e.target.value || null);
                  }}
                  style={{
                    fontFamily: "var(--ll-print)",
                    fontSize: 14,
                    color: "var(--ll-ink)",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1.5px solid var(--ll-ink)",
                    padding: "2px 4px",
                  }}
                />
              </label>
            </>
          )}
        </section>

        {/* Write back */}
        <section style={{ marginTop: 44 }}>
          <label htmlFor="ll-note">
            <Label align="center">write back (optional)</Label>
          </label>
          <textarea
            id="ll-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={NOTE_MAX_LENGTH}
            rows={3}
            style={{
              display: "block",
              width: "100%",
              marginTop: 10,
              ...penText,
              lineHeight: "36px",
              background: "repeating-linear-gradient(transparent 0 35px, var(--ll-rule) 35px 36px)",
              border: "none",
              outline: "none",
              resize: "none",
              padding: "0 4px",
            }}
          />
        </section>

        {/* Send */}
        <section style={{ marginTop: 40, textAlign: "center" }}>
          <p aria-live="polite" style={{ ...penText, minHeight: 30, color: error ? "var(--ll-error)" : "var(--ll-ink)" }}>
            {error ?? (chosen ? chosen.toLowerCase() : pick.date ? "and a time?" : pick.time ? "and a day?" : "")}
          </p>
          <button
            type="button"
            onClick={() => choice && onAccept(choice, note)}
            disabled={!choice || busy}
            style={{
              position: "relative",
              marginTop: 12,
              padding: "12px 34px 10px",
              border: "none",
              background: "none",
              fontFamily: "var(--ll-marker)",
              fontSize: 30,
              color: "var(--ll-ink)",
              cursor: choice && !busy ? "pointer" : "not-allowed",
              opacity: choice && !busy ? 1 : 0.35,
              transition: "opacity .2s",
            }}
          >
            <DrawnBox />
            {busy ? "sending…" : "count me in"}
          </button>
          <div>
            <button
              type="button"
              onClick={onNotThisTime}
              disabled={busy}
              style={{
                ...penText,
                fontSize: 22,
                marginTop: 22,
                background: "none",
                border: "none",
                color: "var(--ll-graphite)",
                textDecoration: "underline",
                textUnderlineOffset: 4,
                cursor: "pointer",
                padding: 6,
              }}
            >
              i can&apos;t make it this time
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

const penText = {
  fontFamily: "var(--ll-pen)",
  fontSize: 25,
  lineHeight: 1.25,
  color: "var(--ll-ink)",
} as const;

function Label({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" | "center" }) {
  return (
    <span
      style={{
        display: "block",
        fontFamily: "var(--ll-print)",
        fontSize: 10,
        fontWeight: 500,
        lineHeight: 1.45,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: "var(--ll-graphite)",
        textAlign: align,
      }}
    >
      {children}
    </span>
  );
}

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{ ...penText, position: "relative", border: "none", background: "none", padding: "2px 6px", cursor: "pointer", textTransform: "lowercase" }}
    >
      {children}
      {selected && <InkCircle pad={7} />}
    </button>
  );
}

function MonthArrow({ label, enabled, onClick, children }: { label: string; enabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!enabled}
      onClick={onClick}
      style={{ ...penText, fontSize: 30, border: "none", background: "none", cursor: "pointer", visibility: enabled ? "visible" : "hidden", padding: "0 8px" }}
    >
      {children}
    </button>
  );
}

/** A box drawn around the send button in one quick pen stroke. */
function DrawnBox() {
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
      <path
        d="M6 8C60 4 140 3 194 6c2 16 2 32 0 48-54 3-130 3-188 0C4 40 3 22 7 5"
        fill="none"
        stroke="var(--ll-ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        filter="url(#ll-ink)"
      />
    </svg>
  );
}
