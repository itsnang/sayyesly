"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldError, Input } from "@/components/shared/ui";
import type { InviteFormValues } from "../../../schemas";
import type { ThemeChoice } from "../../../server/theme-choices";
import type { ThemeContent } from "../../../themes";
import { QuestionField } from "./question-field";
import { ThemeField } from "./theme-field";

const LOCK_NOTE = "Locked, because they've already answered.";

/** The question and who it's for: always open, above everything else. */
export function QuestionFields({ content, answered }: { content: ThemeContent; answered: boolean }) {
  const { register, control, formState } = useFormContext<InviteFormValues>();
  const { errors } = formState;

  return (
    <div id="section-main" className="grid grid-cols-[minmax(0,1fr)] gap-5 px-5 pt-5 pb-6">
      <Controller
        control={control}
        name="question"
        render={({ field }) => (
          <QuestionField
            label={content.question.label}
            placeholder={content.example.question.replace(/\*/g, "")}
            value={field.value}
            onChange={field.onChange}
            disabled={answered}
            error={errors.question?.message ?? (answered ? LOCK_NOTE : undefined)}
          />
        )}
      />
      <Field label="For" optional hint="Only you see this, in your list and Telegram messages." error={errors.recipientName?.message}>
        <Input {...register("recipientName")} aria-invalid={!!errors.recipientName || undefined} placeholder="Their name" autoComplete="off" />
      </Field>
    </div>
  );
}

type ThemeSectionProps = {
  themes: ThemeChoice[];
  savedThemeId: string;
  answered: boolean;
  onUnlock: (theme: ThemeChoice) => void;
};

/** Themes are what we sell: always in view, and every one can be tried on the preview. */
export function ThemeSection({ themes, savedThemeId, answered, onUnlock }: ThemeSectionProps) {
  const { control, formState } = useFormContext<InviteFormValues>();

  return (
    <div id="section-theme" className="border-t border-ink/10 px-5 pt-5 pb-6">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[13.5px] font-medium text-ink">Theme</h2>
        <span className="text-[12.5px] text-muted">{answered ? "Locked" : "Tap to try one on"}</span>
      </div>
      <Controller
        control={control}
        name="themeId"
        render={({ field }) => (
          <ThemeField themes={themes} value={field.value} savedThemeId={savedThemeId} onChange={field.onChange} onUnlock={onUnlock} disabled={answered} />
        )}
      />
      {formState.errors.themeId && <FieldError className="mt-2">{formState.errors.themeId.message}</FieldError>}
    </div>
  );
}
