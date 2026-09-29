import type { Plan } from "../../types";
import { Label, MapLink, penStyle } from "./lettering";
import { Arrow, InkCircle, PaperPlane, Photo } from "./ornaments";

const PHOTO_TILTS = [-2.2, 1.8, -1.2];

/** "the plan": the place circled in ink, what you'll do, the map, taped-in photos, then a NOTE! with dress code and notes. */
export function LetterPlan({ plan }: { plan: Plan }) {
  const hasPlan = Boolean(plan.place || plan.activity || plan.mapUrl);

  return (
    <>
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
                  fontFamily: "var(--env-marker)",
                  fontSize: "clamp(34px, 9vw, 46px)",
                  lineHeight: 1.1,
                  color: "var(--env-ink)",
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
          <p style={{ fontFamily: "var(--env-marker)", fontSize: 30, color: "var(--env-ink)" }}>NOTE!</p>
          {plan.dressCode && <p style={{ ...penStyle, marginTop: 8 }}>★ wear: {plan.dressCode}</p>}
          {plan.notes && <p style={{ ...penStyle, marginTop: 6, whiteSpace: "pre-line" }}>★ {plan.notes}</p>}
        </section>
      )}
    </>
  );
}
