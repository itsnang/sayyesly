"use client";

import { useRef, useState, type ReactNode } from "react";
import type { PublicInvite } from "../../types";
import { NOTE_MAX_LENGTH } from "../../utils/answer";
import { timesFor } from "../../utils/time-of-day";
import { formatInZone, MONTHS, timeLabel } from "../shared/format";
import type { PlanChoice } from "../shared/use-invite-answer";
import { isoDate, usePlanSelection } from "../shared/use-plan-selection";
import { Label, MapLink, penStyle } from "./lettering";
import { Arrow, FlowerRow, InkCircle, Leaf, PaperPlane, Photo, Star, Sun } from "./ornaments";

const WEEKDAYS = ["s", "m", "t", "w", "t", "f", "s"];
const PHOTO_TILTS = [-2.2, 1.8, -1.2];

type LetterScreenProps = {
  invite: PublicInvite;
  busy: boolean;
  error: string | null;
  onYes: (choice: PlanChoice, note: string) => void;
  onMaybeLater: () => void;
};

/** A picked custom date and time, e.g. "Saturday, September 26 at 7:30 PM" (already in the Invite's time zone). */
function customLabel(date: string, time: string) {
  const [y = 0, m = 1, d = 1] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  return `${weekday}, ${MONTHS[m - 1]} ${d} at ${timeLabel(time)}`;
}

/** The Invite, laid out like a page from a diary. */
export function LetterScreen({ invite, busy, error, onYes, onMaybeLater }: LetterScreenProps) {
  const { plan } = invite;
  const selection = usePlanSelection(invite);
  const { calendar, choice } = selection;
  const [otherTime, setOtherTime] = useState("");
  const [note, setNote] = useState("");

  const chosen = selection.slot
    ? (() => {
        const w = formatInZone(selection.slot.startsAt, invite.timezone);
        return `${w.weekday}, ${w.date} at ${w.time}`;
      })()
    : selection.date && selection.time
      ? customLabel(selection.date, selection.time)
      : null;

  const hasPlan = Boolean(plan.place || plan.activity || plan.mapUrl);

  return (
    <div style={{ background: "var(--ll-diary)", minHeight: "100svh" }}>
      <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", padding: "22px 22px 80px", animation: "ll-rise .7s ease-out both" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <Label>
            {plan.place}
            {plan.place && plan.activity && <br />}
            {plan.activity}
          </Label>
          <Label align="right">
            a letter
            <br />
            for you
          </Label>
        </header>

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

        {(invite.imageUrl || invite.message) && (
          <section className="ll-split" style={{ marginTop: 40 }}>
            {invite.imageUrl && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Photo src={invite.imageUrl} alt="" width="min(300px, 88%)" tilt={-1.6} sizes="300px" priority />
              </div>
            )}
            {invite.message && <p style={{ ...penStyle, padding: "0 4px", whiteSpace: "pre-line" }}>{invite.message}</p>}
          </section>
        )}

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
            {plan.activity && <p style={{ ...penStyle, marginTop: plan.place ? 18 : 12 }}>{plan.activity}</p>}
            {plan.mapUrl && <MapLink href={plan.mapUrl} />}

            {plan.photos.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "30px 18px", marginTop: 34 }}>
                {plan.photos.map((p, i) => (
                  <figure key={p.url} style={{ width: "min(46%, 220px)", margin: 0 }}>
                    <Photo src={p.url} alt={p.alt} width="100%" tilt={PHOTO_TILTS[i % PHOTO_TILTS.length] ?? 0} tape={i % 2 === 0} sizes="220px" />
                    {p.caption && (
                      <figcaption style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 2, marginTop: 8 }}>
                        <Arrow width={26} style={{ transform: "rotate(-120deg) scaleY(-1)", marginTop: -2 }} />
                        <span style={{ ...penStyle, fontSize: 22 }}>{p.caption}</span>
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </section>
        )}

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
            <p style={{ fontFamily: "var(--ll-marker)", fontSize: 30, color: "var(--ll-ink)" }}>NOTE!</p>
            {plan.dressCode && <p style={{ ...penStyle, marginTop: 8 }}>★ wear: {plan.dressCode}</p>}
            {plan.notes && <p style={{ ...penStyle, marginTop: 6, whiteSpace: "pre-line" }}>★ {plan.notes}</p>}
          </section>
        )}

        <div style={{ display: "flex", justifyContent: "center", margin: "46px 0 30px" }}>
          <FlowerRow width={180} />
        </div>

        <section style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--ll-marker)", fontWeight: 400, fontSize: 34, color: "var(--ll-ink)" }}>when works for you?</h2>

          {invite.timeSlots.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, marginTop: 22 }}>
              {invite.timeSlots.map((s) => {
                const w = formatInZone(s.startsAt, invite.timezone);
                return (
                  <CircledChoice key={s.id} selected={selection.slotId === s.id} onClick={() => selection.pickSlot(s.id)}>
                    {w.weekday}, {w.date} · {w.time}
                  </CircledChoice>
                );
              })}
            </div>
          )}

          {invite.allowCustomTime && (
            <>
              {invite.timeSlots.length > 0 && <p style={{ ...penStyle, color: "var(--ll-graphite)", marginTop: 28 }}>or another day:</p>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 18 }}>
                <MonthArrow label="previous month" enabled={calendar.canGoBack} onClick={() => calendar.page(-1)}>
                  ‹
                </MonthArrow>
                <span style={{ ...penStyle, fontSize: 28, minWidth: 170 }}>
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
                  const selected = selection.date === iso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={past}
                      aria-pressed={selected}
                      aria-label={`${MONTHS[calendar.month]} ${day}`}
                      onClick={() => selection.pickDate(iso)}
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
                {timesFor(invite.timeOfDay).map((t) => (
                  <CircledChoice
                    key={t}
                    selected={!selection.slotId && selection.time === t}
                    onClick={() => {
                      setOtherTime("");
                      selection.pickTime(t);
                    }}
                  >
                    {timeLabel(t)}
                  </CircledChoice>
                ))}
              </div>
              <label style={{ ...penStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18, color: "var(--ll-graphite)" }}>
                or another time
                <input
                  type="time"
                  value={otherTime}
                  onChange={(e) => {
                    setOtherTime(e.target.value);
                    selection.pickTime(e.target.value || null);
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
              ...penStyle,
              lineHeight: "36px",
              background: "repeating-linear-gradient(transparent 0 35px, var(--ll-rule) 35px 36px)",
              border: "none",
              outline: "none",
              resize: "none",
              padding: "0 4px",
            }}
          />
        </section>

        <section style={{ marginTop: 40, textAlign: "center" }}>
          <p aria-live="polite" style={{ ...penStyle, minHeight: 30, color: error ? "var(--ll-error)" : "var(--ll-ink)" }}>
            {error ?? (chosen ? chosen.toLowerCase() : selection.date ? "and a time?" : selection.time ? "and a day?" : "")}
          </p>
          <button
            type="button"
            onClick={() => choice && onYes(choice, note)}
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
          <div style={{ marginTop: 22 }}>
            <MaybeLater busy={busy} error={error} onConfirm={onMaybeLater} />
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * The quiet way out. An Answer can't be changed, so it asks once more in a note
 * laid over the letter. On success the whole screen is replaced; on failure the
 * note stays open and says why.
 */
function MaybeLater({ busy, error, onConfirm }: { busy: boolean; error: string | null; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  // `error` is shared with "count me in", so only show one this note caused.
  const [sent, setSent] = useState(false);
  const link = { ...penStyle, fontSize: 22, background: "none", border: "none", textUnderlineOffset: 4, cursor: "pointer", padding: 6 } as const;
  const close = () => {
    if (!busy) dialog.current?.close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSent(false);
          dialog.current?.showModal();
        }}
        disabled={busy}
        style={{ ...link, color: "var(--ll-graphite)", textDecoration: "underline" }}
      >
        i can&apos;t make it this time
      </button>

      <dialog
        ref={dialog}
        className="ll-dialog"
        aria-labelledby="ll-decline-title"
        onCancel={(e) => busy && e.preventDefault()}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div style={{ padding: "30px 24px 20px", textAlign: "center" }}>
          <p id="ll-decline-title" style={{ fontFamily: "var(--ll-marker)", fontSize: 32, lineHeight: 1.1, color: "var(--ll-ink)" }}>
            can&apos;t make it this time?
          </p>
          <p style={{ ...penStyle, fontSize: 22, marginTop: 12, color: "var(--ll-graphite)" }}>
            we&apos;ll let them know, gently. once it&apos;s sent, it can&apos;t be changed.
          </p>
          {sent && error && (
            <p role="alert" style={{ ...penStyle, fontSize: 20, marginTop: 10, color: "var(--ll-error)" }}>
              {error}
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap-reverse", justifyContent: "center", alignItems: "center", gap: "6px 22px", marginTop: 22 }}>
            <button type="button" onClick={close} disabled={busy} style={{ ...link, color: "var(--ll-graphite)" }}>
              never mind
            </button>
            <button
              type="button"
              onClick={() => {
                setSent(true);
                onConfirm();
              }}
              disabled={busy}
              style={{
                position: "relative",
                padding: "10px 26px 8px",
                border: "none",
                background: "none",
                fontFamily: "var(--ll-marker)",
                fontSize: 26,
                color: "var(--ll-ink)",
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              <DrawnBox />
              {busy ? "sending…" : "send it"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function CircledChoice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{ ...penStyle, position: "relative", border: "none", background: "none", padding: "2px 6px", cursor: "pointer", textTransform: "lowercase" }}
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
      style={{ ...penStyle, fontSize: 30, border: "none", background: "none", cursor: "pointer", visibility: enabled ? "visible" : "hidden", padding: "0 8px" }}
    >
      {children}
    </button>
  );
}

/** A box drawn around "count me in" in one quick pen stroke. */
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
