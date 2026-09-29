"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { chipClass, cx, Field, FieldError } from "@/components/shared/ui";
import { StudioSection } from "../../../enums";
import { MAX_TIME_SLOTS, type InviteFormValues } from "../../../schemas";
import { useStudio } from "../../../stores/studio-store";
import type { ThemeContent } from "../../../themes";
import { timeLabel } from "../../../themes/shared/format";
import { TIME_OF_DAY_LABELS, TIMES_OF_DAY, timesFor } from "../../../utils/time-of-day";
import { Section } from "./section";
import { TimesField } from "./times-field";
import { TimeZoneSelect } from "./time-zone-select";

const WHO_PICKS = [
  { value: true, label: "Let them pick" },
  { value: false, label: "I'll pick the times" },
] as const;

/** When: who picks the time, the Part of the day, the Time slots and the time zone. Locked once answered. */
export function WhenSection({ content, answered }: { content: ThemeContent; answered: boolean }) {
  const { control, trigger, formState } = useFormContext<InviteFormValues>();
  const { errors } = formState;
  const slots = useFieldArray({ control, name: "timeSlots" });
  const [allowCustomTime, timeOfDay, timeSlots, timezone] = useWatch({ control, name: ["allowCustomTime", "timeOfDay", "timeSlots", "timezone"] });
  const editingZone = useStudio((s) => s.editingZone);
  const toggleEditingZone = useStudio((s) => s.toggleEditingZone);

  // "Offer a time or let them pick" spans two fields: re-check it as soon as either changes.
  const slotCount = timeSlots?.length ?? 0;
  const timesError = !!errors.timeSlots;
  useEffect(() => {
    if (timesError) void trigger("timeSlots");
  }, [slotCount, allowCustomTime, timesError, trigger]);

  const quickTimes = timesFor(timeOfDay);
  const timesMessage = errors.timeSlots?.message ?? errors.timeSlots?.root?.message;

  return (
    <Section id={StudioSection.When} content={content} locked={answered}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
        <Controller
          control={control}
          name="allowCustomTime"
          render={({ field }) => (
            <div role="radiogroup" aria-label="Who picks the time" className="grid grid-cols-2 gap-1 rounded-[8px] border border-ink/15 bg-surface p-1">
              {WHO_PICKS.map((mode) => (
                <button
                  key={mode.label}
                  type="button"
                  role="radio"
                  aria-checked={field.value === mode.value}
                  disabled={answered}
                  onClick={() => field.onChange(mode.value)}
                  className={cx(
                    "rounded-[6px] px-2 py-2 text-[13.5px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:cursor-not-allowed",
                    field.value === mode.value ? "bg-white text-ink shadow-[0_1px_3px_rgba(35,27,23,0.14)]" : "text-muted hover:text-ink",
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}
        />

        <div>
          <p className="mb-2 text-[13.5px] font-medium text-ink">Part of the day</p>
          <Controller
            control={control}
            name="timeOfDay"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Part of the day" className="flex flex-wrap gap-1.5">
                {TIMES_OF_DAY.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={field.value === t}
                    disabled={answered}
                    onClick={() => field.onChange(t)}
                    className={chipClass(field.value === t, "px-3 py-1.5 text-[13.5px]")}
                  >
                    {TIME_OF_DAY_LABELS[t]}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {allowCustomTime ? (
          <p className="text-[13px] leading-relaxed text-muted">
            They get a calendar to choose a day, then a time from{" "}
            <b className="font-medium text-ink">
              {timeLabel(quickTimes[0]!)} to {timeLabel(quickTimes.at(-1)!)}
            </b>{" "}
            or any other time they write in.
          </p>
        ) : (
          <TimesField
            slots={timeSlots ?? []}
            quickTimes={quickTimes}
            timezone={timezone}
            onAdd={(s) => slots.append(s)}
            onRemove={(i) => slots.remove(i)}
            disabled={answered}
            max={MAX_TIME_SLOTS}
          />
        )}
        {timesMessage && <FieldError className="-mt-2">{timesMessage}</FieldError>}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
          <span>
            Time zone: <b className="font-medium text-ink">{timezone.replace(/_/g, " ")}</b>
          </span>
          {!answered && (
            <button type="button" onClick={toggleEditingZone} className="text-ink underline underline-offset-4">
              {editingZone ? "Done" : "Change"}
            </button>
          )}
        </div>
        {editingZone && (
          <Field label="Time zone" hint="Every time on this invite is in this zone, for you and for them." error={errors.timezone?.message}>
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => <TimeZoneSelect value={field.value} onChange={field.onChange} disabled={answered} invalid={!!errors.timezone} />}
            />
          </Field>
        )}
      </div>
    </Section>
  );
}
