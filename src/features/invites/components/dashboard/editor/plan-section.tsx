"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Field, Input, Note } from "@/components/shared/ui";
import { StudioSection } from "../../../enums";
import { MAX_PLAN_PHOTOS, type InviteFormValues } from "../../../schemas";
import type { ThemeContent } from "../../../themes";
import { PhotosField } from "./photos-field";
import { StopsField } from "./stops-field";
import { Section } from "./section";

/**
 * The Plan: where, what, a map link, dress code, notes and (if the Theme shows
 * them) photos. A Theme with several Stops gets a cover title and its Stops instead
 * of the one place; dress code and notes stay for the whole day.
 */
export function PlanSection({ content, uploadsEnabled }: { content: ThemeContent; uploadsEnabled: boolean }) {
  if (content.stops) return <StopsPlanSection content={content} label={content.stops.label} uploadsEnabled={uploadsEnabled} />;
  return <PlacePlanSection content={content} uploadsEnabled={uploadsEnabled} />;
}

function StopsPlanSection({ content, label, uploadsEnabled }: { content: ThemeContent; label: string; uploadsEnabled: boolean }) {
  const { register, formState } = useFormContext<InviteFormValues>();
  const { errors } = formState;
  return (
    <Section id={StudioSection.Plan} content={content}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        <p className="text-[13px] text-muted">Each {label} gets its own page, in this order.</p>
        <Field label="Title on the cover" optional hint={'Left empty, it says "our day".'} error={errors.planTitle?.message}>
          <Input {...register("planTitle")} placeholder="The Three Chapters" />
        </Field>
        <StopsField label={label} uploadsEnabled={uploadsEnabled} />
        <DressCodeAndNotes />
      </div>
    </Section>
  );
}

function DressCodeAndNotes() {
  const { register, formState } = useFormContext<InviteFormValues>();
  const { errors } = formState;
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Dress code" optional error={errors.planDressCode?.message}>
        <Input {...register("planDressCode")} placeholder="comfy" />
      </Field>
      <Field label="Notes" optional error={errors.planNotes?.message}>
        <Input {...register("planNotes")} placeholder="pick-up at 6:45" />
      </Field>
    </div>
  );
}

function PlacePlanSection({ content, uploadsEnabled }: { content: ThemeContent; uploadsEnabled: boolean }) {
  const { register, control, setValue, formState } = useFormContext<InviteFormValues>();
  const { errors } = formState;
  const photos = useFieldArray({ control, name: "planPhotos" });
  const photoValues = useWatch({ control, name: "planPhotos" });

  return (
    <Section id={StudioSection.Plan} content={content}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        <p className="text-[13px] text-muted">Shown after they say yes. Leave it empty to keep it a surprise.</p>
        {errors.planStops && (
          <Note tone="warn">
            A Stop you added in a Theme with several Stops needs a name. Switch back to that Theme to fix or remove it.
          </Note>
        )}
        <Field label="Where" optional error={errors.planPlace?.message}>
          <Input {...register("planPlace")} placeholder="the café by the river" />
        </Field>
        <Field label="What you'll do" optional error={errors.planActivity?.message}>
          <Input {...register("planActivity")} placeholder="dinner, then a walk" />
        </Field>
        <Field label="Map link" optional hint="In Google Maps: Share → Copy link." error={errors.planMapUrl?.message}>
          <Input {...register("planMapUrl")} type="url" inputMode="url" placeholder="https://maps.app.goo.gl/…" />
        </Field>
        <DressCodeAndNotes />

        {content.planPhotos && (
          <div>
            <p className="mb-2 flex items-baseline gap-2 text-[13.5px] font-medium text-ink">
              Photos <span className="text-[12.5px] font-normal text-faint">optional, up to {MAX_PLAN_PHOTOS}</span>
            </p>
            <PhotosField
              photos={photos.fields.map((f, i) => ({ key: f.id, url: photoValues?.[i]?.url ?? "" }))}
              max={MAX_PLAN_PHOTOS}
              uploadsEnabled={uploadsEnabled}
              onAdd={(url) => photos.append({ url, alt: "", caption: "" })}
              onRemove={(i) => photos.remove(i)}
              onUrlChange={(i, url) => setValue(`planPhotos.${i}.url`, url, { shouldDirty: true, shouldValidate: !!errors.planPhotos?.[i] })}
              caption={(i) => <Input {...register(`planPhotos.${i}.caption`)} placeholder="Caption, e.g. the view" />}
              error={(i) => errors.planPhotos?.[i]?.url?.message}
            />
          </div>
        )}
      </div>
    </Section>
  );
}
