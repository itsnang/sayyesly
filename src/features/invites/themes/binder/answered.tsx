import { AnswerKind } from "@/lib/enums";
import type { Plan, PublicAnswer } from "../../types";
import { formatInZone } from "../shared/format";
import { PlanList } from "./chapter";
import { COLORS } from "./palette";
import { BackBoard, FONT, LabelStrip, Rings, Sheet, Sticker, StickerKind, TypedCard } from "./pieces";

/**
 * After the Answer: one sheet on the rings, no more pages. A Yes shows when, and
 * the plan to keep; Maybe later is warm, with no second ask.
 */
export function Answered({ answer, plan, timezone, justAnswered }: { answer: PublicAnswer; plan: Plan; timezone: string; justAnswered: boolean }) {
  const yes = answer.answer === AnswerKind.Yes;
  const when = answer.startsAt ? formatInZone(answer.startsAt, timezone) : null;
  return (
    <div style={{ position: "relative", width: "min(380px, 100%)" }}>
      <BackBoard />
      <Sheet style={{ padding: "52px 24px 44px", textAlign: "center" }}>
        <style>{`@keyframes binder-stamp { 0% { opacity: 0; transform: scale(1.8) rotate(-14deg) } 60% { opacity: 1; transform: scale(.94) rotate(-5deg) } 100% { transform: rotate(-6deg) } }`}</style>
        <Sticker kind={StickerKind.Star} size={46} style={{ top: 30, right: 24 }} />
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
            border: `3.5px solid currentColor`,
            borderRadius: 8,
            boxShadow: "inset 0 0 0 2px #fdfcf8, inset 0 0 0 3.5px currentColor",
            opacity: 0.88,
            transform: "rotate(-6deg)",
            animation: justAnswered ? "binder-stamp .55s cubic-bezier(.3,1.4,.6,1) both" : undefined,
          }}
        >
          {yes ? "it's a date!" : "another time ♡"}
        </h1>
        {when && (
          <p style={{ fontFamily: FONT.hand, fontSize: 26, color: COLORS.ink, margin: "12px 0 0", textTransform: "lowercase" }}>
            {when.weekday}, {when.date} · {when.time}
          </p>
        )}
        {!yes && <p style={{ fontFamily: FONT.note, fontSize: 15, color: COLORS.soft, margin: "14px 0 0" }}>thank you for letting me know.</p>}

        {yes && (plan.stops.length > 0 || plan.dressCode || plan.notes) && (
          <TypedCard rotate={-1.5} style={{ margin: "26px 10px 0", textAlign: "left" }}>
            <PlanList plan={plan} heading={plan.title ? plan.title.toLowerCase() : "the plan"} withMaps />
          </TypedCard>
        )}

        {answer.note && (
          <p style={{ fontFamily: FONT.note, fontSize: 15, color: COLORS.ink, margin: "26px 0 0", whiteSpace: "pre-line" }}>you wrote: &ldquo;{answer.note}&rdquo;</p>
        )}
      </Sheet>
      <Rings />
    </div>
  );
}
