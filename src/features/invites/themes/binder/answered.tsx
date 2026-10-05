import { AnswerKind } from "@/lib/enums";
import type { Plan, PublicAnswer } from "../../types";
import { formatInZone } from "../shared/format";
import { PlanCheck, PlanNotes } from "./chapter";
import { COLORS } from "./palette";
import { BackBoard, FONT, LabelStrip, Script, Sheet, Spiral, Sticker, StickerKind } from "./pieces";

/**
 * After the Answer: one page on the spiral, no more turning. A Yes is stamped
 * on, with when, and the plan to keep; Maybe later is warm, with no second ask.
 */
export function Answered({ answer, plan, timezone, justAnswered }: { answer: PublicAnswer; plan: Plan; timezone: string; justAnswered: boolean }) {
  const yes = answer.answer === AnswerKind.Yes;
  const when = answer.startsAt ? formatInZone(answer.startsAt, timezone) : null;
  return (
    <div style={{ position: "relative", width: "min(380px, 100%)", paddingLeft: 14 }}>
      <div style={{ position: "relative" }}>
        <BackBoard />
        <Sheet style={{ padding: "40px 18px 40px 34px", textAlign: "center" }}>
          <style>{`@keyframes binder-stamp { 0% { opacity: 0; transform: scale(1.8) rotate(-14deg) } 60% { opacity: 1; transform: scale(.94) rotate(-5deg) } 100% { transform: rotate(-6deg) } }`}</style>
          <Sticker kind={StickerKind.Butterfly} size={46} style={{ top: 22, right: 18 }} />
          <LabelStrip>{justAnswered ? "your answer is on its way" : "your answer"}</LabelStrip>
          {/* a rubber stamp, pressed down when the Answer is sent */}
          <h1
            style={{
              display: "inline-block",
              margin: "26px 0 6px",
              padding: "8px 16px 6px",
              fontFamily: FONT.marker,
              fontSize: 36,
              fontWeight: 400,
              lineHeight: 1.05,
              textTransform: "uppercase",
              color: yes ? COLORS.accent : COLORS.brown,
              border: "3.5px solid currentColor",
              borderRadius: 8,
              boxShadow: `inset 0 0 0 2px ${COLORS.paper}, inset 0 0 0 3.5px currentColor`,
              opacity: 0.88,
              transform: "rotate(-6deg)",
              animation: justAnswered ? "binder-stamp .55s cubic-bezier(.3,1.4,.6,1) both" : undefined,
            }}
          >
            {yes ? "it's a date!" : "another time ♡"}
          </h1>
          {when && (
            <Script size={30} rotate={-2} style={{ marginTop: 12, textTransform: "lowercase" }}>
              {when.weekday}, {when.date} · {when.time}
            </Script>
          )}
          {!yes && <p style={{ fontFamily: FONT.note, fontSize: 15, color: COLORS.soft, margin: "14px 0 0" }}>thank you for letting me know.</p>}

          {yes && plan.stops.length > 0 && <PlanCheck plan={plan} withMaps style={{ margin: "26px 4px 0", textAlign: "left" }} />}
          {yes && <PlanNotes plan={plan} style={{ margin: "20px 30px 0", textAlign: "left" }} />}

          {answer.note && (
            <p style={{ fontFamily: FONT.note, fontSize: 15, color: COLORS.blue, margin: "24px 0 0", whiteSpace: "pre-line" }}>you wrote: &ldquo;{answer.note}&rdquo;</p>
          )}
        </Sheet>
        <Spiral />
      </div>
    </div>
  );
}
