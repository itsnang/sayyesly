"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch, type FieldPath } from "react-hook-form";
import { Button, Field, Input, Switch, Textarea } from "@/components/shared/ui";
import { saveInvite } from "../../../actions";
import { inviteFormSchema, MAX_PLAN_PHOTOS, MAX_TIME_SLOTS, type InviteFormValues } from "../../../schemas";
import type { ThemeChoice } from "../../../server/theme-access";
import { ImageField } from "../image-field";
import { PreviewPhone } from "./preview-phone";
import { QuestionField } from "./question-field";
import { ThemeField } from "./theme-field";
import { TimesField } from "./times-field";

const STEPS: { title: string; hint: string; fields: FieldPath<InviteFormValues>[] }[] = [
  { title: "Question", hint: "Who it's for and what you're asking.", fields: ["recipientName", "question", "message", "imageUrl"] },
  { title: "Plan", hint: "What they see after they say yes.", fields: ["planPlace", "planActivity", "planMapUrl", "planDressCode", "planNotes", "planPhotos"] },
  { title: "When", hint: "The times that work for you.", fields: ["timezone", "timeSlots", "allowCustomTime"] },
  { title: "Look", hint: "Pick the theme they'll open.", fields: ["themeId"] },
];

type InviteEditorProps = {
  inviteId: string | null;
  defaults: InviteFormValues;
  answered: boolean;
  themes: ThemeChoice[];
  uploadsEnabled: boolean;
};

export function InviteEditor({ inviteId, defaults, answered, themes, uploadsEnabled }: InviteEditorProps) {
  const router = useRouter();
  const isNew = inviteId === null;
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<InviteFormValues>({ resolver: zodResolver(inviteFormSchema), defaultValues: defaults, mode: "onTouched" });
  const slots = useFieldArray({ control, name: "timeSlots" });
  const photos = useFieldArray({ control, name: "planPhotos" });
  const values = useWatch({ control }) as InviteFormValues;

  // New invites start in the Creator's own time zone.
  useEffect(() => {
    if (!isNew) return;
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone && zone !== defaults.timezone) setValue("timezone", zone);
  }, [isNew, defaults.timezone, setValue]);

  const timeZones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return ["Asia/Phnom_Penh"];
    }
  }, []);

  const stepHasError = (i: number) => STEPS[i]!.fields.some((f) => f.split(".")[0]! in errors);
  const lockNote = "Locked, because they've already answered.";

  async function goTo(next: number) {
    // Moving forward checks the current step first; going back never blocks.
    if (next > step && !(await trigger(STEPS[step]!.fields))) return;
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(data: InviteFormValues) {
    setServerError(null);
    setSaved(false);
    const result = await saveInvite(inviteId, data);
    if (result.error || !result.id) {
      setServerError(result.error ?? "Couldn't save. Please try again.");
      return;
    }
    if (isNew) {
      router.push(`/dashboard/invites/${result.id}?created=1`);
      return;
    }
    reset(data);
    setSaved(true);
    router.refresh();
  }

  const onInvalid = () => {
    const first = STEPS.findIndex((_, i) => stepHasError(i));
    if (first >= 0) setStep(first);
  };

  const last = step === STEPS.length - 1;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="min-w-0">
        {/* Steps */}
        <ol className="mb-8 grid grid-cols-4 gap-1.5">
          {STEPS.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => (isNew && i > step ? goTo(i) : setStep(i))}
                  aria-current={active ? "step" : undefined}
                  className="group w-full text-left"
                >
                  <span className={`block h-1 rounded-full transition-colors ${active ? "bg-ink" : done ? "bg-ink/40" : "bg-ink/12"} ${stepHasError(i) ? "!bg-red-500" : ""}`} />
                  <span className={`mt-2 block text-[13px] ${active ? "font-medium text-ink" : "text-muted group-hover:text-ink"}`}>
                    <span className="font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")} </span>
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mb-6">
          <h2 className="font-display text-[28px] leading-tight text-ink">{STEPS[step]!.title}</h2>
          <p className="mt-1 text-[14.5px] text-muted">{STEPS[step]!.hint}</p>
        </div>

        <div className="rounded-[20px] border border-ink/12 bg-card p-5 sm:p-7">
          {step === 0 && (
            <div className="grid gap-6">
              <Field label="Who is it for?" hint="Their first name. It shows up in your Telegram message, never on the link preview." error={errors.recipientName?.message}>
                <Input {...register("recipientName")} placeholder="e.g. Sreyneang" autoComplete="off" />
              </Field>
              <Controller
                control={control}
                name="question"
                render={({ field }) => (
                  <QuestionField value={field.value} onChange={field.onChange} disabled={answered} error={errors.question?.message ?? (answered ? lockNote : undefined)} />
                )}
              />
              <Field label="A little note under the question" optional error={errors.message?.message}>
                <Textarea {...register("message")} rows={2} placeholder="no pressure :)" />
              </Field>
              <Field label="Picture at the top" optional hint="Leave it empty for the kitten with the bouquet." error={errors.imageUrl?.message}>
                <Controller
                  control={control}
                  name="imageUrl"
                  render={({ field }) => <ImageField value={field.value} onChange={field.onChange} uploadsEnabled={uploadsEnabled} />}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Place" error={errors.planPlace?.message}>
                <Input {...register("planPlace")} placeholder="mauu steak" />
              </Field>
              <Field label="What you'll do" optional error={errors.planActivity?.message}>
                <Input {...register("planActivity")} placeholder="steak dinner" />
              </Field>
              <Field label="Map link" optional hint="In Google Maps: Share → Copy link." error={errors.planMapUrl?.message} className="sm:col-span-2">
                <Input {...register("planMapUrl")} type="url" inputMode="url" placeholder="https://maps.app.goo.gl/…" />
              </Field>
              <Field label="Dress code" optional error={errors.planDressCode?.message}>
                <Input {...register("planDressCode")} placeholder="comfy" />
              </Field>
              <Field label="Anything else" optional error={errors.planNotes?.message}>
                <Input {...register("planNotes")} placeholder="I'll pick you up at 6:45" />
              </Field>

              <div className="sm:col-span-2">
                <p className="mb-1 text-[13px] font-medium text-ink">
                  Photos of the place <span className="font-normal text-faint">optional, up to {MAX_PLAN_PHOTOS}</span>
                </p>
                <p className="mb-3 text-[12.5px] text-muted">The first one is shown big; the others get a small caption.</p>
                <div className="grid gap-4">
                  {photos.fields.map((photo, i) => (
                    <div key={photo.id} className="rounded-2xl border border-ink/12 bg-surface/60 p-3">
                      <Controller
                        control={control}
                        name={`planPhotos.${i}.url`}
                        render={({ field }) => (
                          <ImageField
                            value={field.value}
                            onChange={(url) => (url ? field.onChange(url) : photos.remove(i))}
                            uploadsEnabled={uploadsEnabled}
                          />
                        )}
                      />
                      {errors.planPhotos?.[i]?.url && <p className="mt-1 text-[12.5px] text-red-700">{errors.planPhotos[i]?.url?.message}</p>}
                      {i > 0 && <Input {...register(`planPhotos.${i}.caption`)} placeholder="caption, e.g. the vibe ✦" className="mt-3" />}
                    </div>
                  ))}
                </div>
                {photos.fields.length < MAX_PLAN_PHOTOS && (
                  <Button variant="secondary" className="mt-3" onClick={() => photos.append({ url: "", alt: "", caption: "" })}>
                    + Add a photo
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6">
              <div className="flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
                <span>
                  Times are in <b className="font-medium text-ink">{values.timezone}</b>, wherever they open the link.
                </span>
                {!answered && (
                  <button type="button" onClick={() => setEditingZone((v) => !v)} className="text-ink underline underline-offset-4">
                    {editingZone ? "Done" : "Change"}
                  </button>
                )}
              </div>
              {editingZone && (
                <Field label="Time zone" error={errors.timezone?.message}>
                  <Input {...register("timezone")} list="time-zones" />
                  <datalist id="time-zones">
                    {timeZones.map((tz) => (
                      <option key={tz} value={tz} />
                    ))}
                  </datalist>
                </Field>
              )}

              <TimesField
                slots={values.timeSlots ?? []}
                timezone={values.timezone}
                onAdd={(s) => slots.append(s)}
                onRemove={(i) => slots.remove(i)}
                disabled={answered}
                max={MAX_TIME_SLOTS}
              />
              {(errors.timeSlots?.message || errors.timeSlots?.root?.message) && (
                <p role="alert" className="-mt-3 text-[12.5px] text-red-700">
                  {errors.timeSlots?.message ?? errors.timeSlots?.root?.message}
                </p>
              )}

              <Switch
                {...register("allowCustomTime")}
                disabled={answered}
                label="Let them suggest a time"
                description="They get a calendar and can pick any day and time, as well as your offers."
              />
              {answered && <p className="text-[12.5px] text-muted">{lockNote}</p>}
            </div>
          )}

          {step === 3 && (
            <div>
              <Controller
                control={control}
                name="themeId"
                render={({ field }) => (
                  <ThemeField themes={themes} value={field.value} savedThemeId={defaults.themeId} onChange={field.onChange} disabled={answered} />
                )}
              />
              {errors.themeId && <p className="mt-2 text-[12.5px] text-red-700">{errors.themeId.message}</p>}
              {answered && <p className="mt-3 text-[12.5px] text-muted">{lockNote}</p>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t border-ink/10 bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
          {step > 0 && (
            <Button variant="ghost" onClick={() => goTo(step - 1)}>
              ← Back
            </Button>
          )}
          <Button variant="secondary" className="lg:hidden" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>

          <div className="ml-auto flex items-center gap-3">
            {serverError && (
              <p role="alert" className="text-[13px] text-red-700">
                {serverError}
              </p>
            )}
            {saved && !isDirty && <p className="text-[13px] text-emerald-700">Saved ✓</p>}
            {!isNew && (
              <Button type="submit" variant={last ? "primary" : "secondary"} disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            )}
            {!last ? (
              <Button onClick={() => goTo(step + 1)}>Next: {STEPS[step + 1]!.title} →</Button>
            ) : (
              isNew && (
                <Button type="submit" variant="rose" disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create invite ♥"}
                </Button>
              )
            )}
          </div>
        </div>
      </form>

      <aside aria-label="Preview">
        <PreviewPhone values={values} open={previewOpen} onClose={() => setPreviewOpen(false)} />
      </aside>
    </div>
  );
}
