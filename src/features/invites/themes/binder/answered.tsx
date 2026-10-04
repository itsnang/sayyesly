import { AnswerKind } from "@/lib/enums";
import type { Plan, PublicAnswer } from "../../types";
import { formatInZone } from "../shared/format";
import { PlanList } from "./chapter";
import { COLORS } from "./palette";
import { FONT, LabelStrip, Rings, Sheet, Sticker, StickerKind, TypedCard } from "./pieces";

/**
 * After the Answer: one sheet on the rings, no more pages. A Yes shows when, and
 * the plan to keep; Maybe later is warm, with no second ask.
 */
export function Answered({ answer, plan, timezone, justAnswered }: { answer: PublicAnswer; plan: Plan; timezone: string; justAnswered: boolean }) {
  const yes = answer.answer === AnswerKind.Yes;
  const when = answer.startsAt ? formatInZone(answer.startsAt, timezone) : null;
  return (
    <div style={{ position: "relative", width: "min(380px, 100%)" }}>
      <Sheet style={{ padding: "52px 24px 44px", textAlign: "center", animation: justAnswered ? "binder-in .6s ease-out both" : undefined }}>
        <style>{`@keyframes binder-in { from { opacity: 0; transform: translateY(14px) rotate(1deg) } to { opacity: 1; transform: none } }`}</style>
        <Sticker kind={StickerKind.Star} size={46} style={{ top: 30, right: 24 }} />
        <LabelStrip>{justAnswered ? "your answer is on its way" : "your answer"}</LabelStrip>
        <h1 style={{ fontFamily: FONT.hand, fontSize: 54, fontWeight: 700, lineHeight: 1, color: yes ? COLORS.brown : COLORS.ink, margin: "18px 0 0" }}>
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
