"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button, Field, Input, Textarea, cx } from "@/components/shared/ui";
import { MAX_PLAN_PHOTOS, MAX_STOPS, type InviteFormValues } from "../../../schemas";
import { startingStops } from "../../../utils/invite-content";
import { PhotosField } from "./photos-field";

/**
 * The Stops of a Plan with several, one card each (a Theme's "chapters"): open a
 * card to fill it in, move it up or down, or remove it. The list starts from the
 * Stops already there, else the Invite's one place, else one empty card.
 */
export function StopsField({ label, uploadsEnabled }: { label: string; uploadsEnabled: boolean }) {
  const { control, getValues, setValue, formState } = useFormContext<InviteFormValues>();
  const stops = useFieldArray({ control, name: "planStops" });
  const titles = useWatch({ control, name: "planStops" });
  const [open, setOpen] = useState(0);

  // Seed once, without marking the form changed: opening an Invite isn't an edit.
  useEffect(() => {
    if (getValues("planStops").length === 0) setValue("planStops", startingStops(getValues()), { shouldDirty: false });
  }, [getValues, setValue]);

  const errors = formState.errors.planStops;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5">
      {stops.fields.map((field, i) => {
        const isOpen = open === i;
        const title = titles?.[i]?.title?.trim();
        const hasError = !!errors?.[i];
        return (
          <div key={field.id} className={cx("rounded-[8px] border bg-white", hasError ? "border-red-700" : "border-ink/20")}>
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex min-w-0 flex-1 items-baseline gap-2 rounded-[6px] px-1.5 py-1 text-left"
              >
                <span className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
                  {label} {i + 1}
                </span>
                <span className={cx("truncate text-[14px]", title ? "text-ink" : "text-faint")}>{title || "untitled"}</span>
              </button>
              <CardButton label={`Move ${label} ${i + 1} up`} disabled={i === 0} onClick={() => (stops.move(i, i - 1), setOpen(i - 1))}>
                ↑
              </CardButton>
              <CardButton label={`Move ${label} ${i + 1} down`} disabled={i === stops.fields.length - 1} onClick={() => (stops.move(i, i + 1), setOpen(i + 1))}>
                ↓
              </CardButton>
              <CardButton label={`Remove ${label} ${i + 1}`} disabled={stops.fields.length === 1} onClick={() => (stops.remove(i), setOpen(-1))}>
                ✕
              </CardButton>
            </div>
            {isOpen && <StopFields index={i} uploadsEnabled={uploadsEnabled} />}
          </div>
        );
      })}

      {stops.fields.length < MAX_STOPS && (
        <Button
          variant="secondary"
          size="sm"
          className="justify-self-start"
          onClick={() => {
            stops.append({ title: "", line: "", time: "", description: "", place: "", mapUrl: "", photos: [] });
            setOpen(stops.fields.length);
          }}
        >
          + Add a {label}
        </Button>
      )}
    </div>
  );
}

function CardButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 shrink-0 place-items-center rounded-[6px] text-[14px] text-muted transition hover:bg-surface hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** One Stop's fields: its name and handwritten line, time, what happens, where, and photos. */
function StopFields({ index, uploadsEnabled }: { index: number; uploadsEnabled: boolean }) {
  const { register, control, setValue, formState } = useFormContext<InviteFormValues>();
  const photos = useFieldArray({ control, name: `planStops.${index}.photos` });
  const photoValues = useWatch({ control, name: `planStops.${index}.photos` });
  const errors = formState.errors.planStops?.[index];
  const name = (field: "title" | "line" | "time" | "description" | "place" | "mapUrl") => `planStops.${index}.${field}` as const;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3.5 border-t border-ink/10 px-3 pt-3 pb-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name" error={errors?.title?.message}>
          <Input {...register(name("title"))} placeholder="Lunch" />
        </Field>
        <Field label="Time" optional error={errors?.time?.message}>
          <Input {...register(name("time"))} placeholder="12:00" />
        </Field>
      </div>
      <Field label="Handwritten line" optional error={errors?.line?.message}>
        <Input {...register(name("line"))} placeholder="enjoy lunch" />
      </Field>
      <Field label="What you'll do" optional error={errors?.description?.message}>
        <Textarea {...register(name("description"))} rows={3} placeholder="We'll grill far too much meat, then order one more plate anyway." />
      </Field>
      <Field label="Where" optional error={errors?.place?.message}>
        <Input {...register(name("place"))} placeholder="the Korean BBQ place" />
      </Field>
      <Field label="Map link" optional hint="In Google Maps: Share → Copy link." error={errors?.mapUrl?.message}>
        <Input {...register(name("mapUrl"))} type="url" inputMode="url" placeholder="https://maps.app.goo.gl/…" />
      </Field>
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
          onUrlChange={(i, url) =>
            setValue(`planStops.${index}.photos.${i}.url`, url, { shouldDirty: true, shouldValidate: !!errors?.photos?.[i] })
          }
          caption={(i) => <Input {...register(`planStops.${index}.photos.${i}.caption`)} placeholder="Caption, e.g. the grill" />}
          error={(i) => errors?.photos?.[i]?.url?.message}
        />
      </div>
    </div>
  );
}
