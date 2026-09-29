"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, Textarea } from "@/components/shared/ui";
import { StudioSection } from "../../../enums";
import type { InviteFormValues } from "../../../schemas";
import type { ThemeContent } from "../../../themes";
import { ImageField } from "../image-field";
import { Section } from "./section";
import { extrasTitle } from "./sections";
import { SongField } from "./song-field";

/** The note, picture and Song, whichever of them the selected Theme shows (nothing at all if none). */
export function ExtrasSection({ content, uploadsEnabled }: { content: ThemeContent; uploadsEnabled: boolean }) {
  const { register, control, formState } = useFormContext<InviteFormValues>();
  const { errors } = formState;
  if (!extrasTitle(content)) return null;

  return (
    <Section id={StudioSection.Extras} content={content}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
        {content.note && (
          <Field label="Note under the question" optional error={errors.message?.message}>
            <Textarea {...register("message")} rows={2} placeholder={content.example.note} />
          </Field>
        )}
        {content.picture && (
          <Field label={content.picture.label} optional hint={`Leave it empty for ${content.picture.whenEmpty}.`} error={errors.imageUrl?.message}>
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => <ImageField value={field.value} onChange={field.onChange} uploadsEnabled={uploadsEnabled} />}
            />
          </Field>
        )}
        {content.song && <SongField />}
      </div>
    </Section>
  );
}
