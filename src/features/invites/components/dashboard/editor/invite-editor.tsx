"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller, useFieldArray, useForm, useWatch, type FieldErrors, type FieldPath } from "react-hook-form";
import { Button, Checkbox, cx, Field, FieldError, Input, Note, Textarea } from "@/components/shared/ui";
import { saveInvite } from "../../../actions";
import { inviteFormSchema, MAX_PLAN_PHOTOS, MAX_TIME_SLOTS, type InviteFormValues } from "../../../schemas";
import type { ThemeChoice } from "../../../server/theme-access";
import { ImageField } from "../image-field";
import { PreviewPhone } from "./preview-phone";
import { QuestionField } from "./question-field";
import { ThemeField } from "./theme-field";
import { TimesField } from "./times-field";

type SectionId = "ask" | "plan" | "when" | "look";

const SECTIONS: { id: SectionId; title: string; hint: string; fields: FieldPath<InviteFormValues>[] }[] = [
  { id: "ask", title: "The question", hint: "Who it's for and what you're asking.", fields: ["recipientName", "question", "message", "imageUrl"] },
  { id: "plan", title: "The plan", hint: "What they see after they say yes.", fields: ["planPlace", "planActivity", "planMapUrl", "planDressCode", "planNotes", "planPhotos"] },
  { id: "when", title: "When", hint: "The times that work for you.", fields: ["timezone", "timeSlots", "allowCustomTime"] },
  { id: "look", title: "The look", hint: "The theme they'll open.", fields: ["themeId"] },
];

// Plan fields folded under "More details" unless they're already filled in.
const EXTRA_PLAN_FIELDS = ["planMapUrl", "planDressCode", "planNotes", "planPhotos"] as const;

const hasError = (errors: FieldErrors<InviteFormValues>, fields: FieldPath<InviteFormValues>[]) =>
  fields.some((f) => f.split(".")[0]! in errors);

function isFilled(id: SectionId, v: InviteFormValues): boolean {
  switch (id) {
    case "ask":
      return !!v.recipientName?.trim() && !!v.question?.replace(/\*/g, "").trim();
    case "plan":
      return !!(v.planPlace?.trim() || v.planActivity?.trim());
    case "when":
      return (v.timeSlots?.length ?? 0) > 0 || !!v.allowCustomTime;
    case "look":
      return !!v.themeId;
  }
}

function Section({
  index,
  section,
  filled,
  invalid,
  children,
}: {
  index: number;
  section: (typeof SECTIONS)[number];
  filled: boolean;
  invalid: boolean;
  children: ReactNode;
}) {
  return (
    <section id={`section-${section.id}`} aria-labelledby={`section-${section.id}-title`} className="scroll-mt-20">
      <header className="mb-3 flex items-center gap-3">
        <span
          aria-hidden
          className={cx(
            "grid size-8 shrink-0 place-items-center rounded-[5px] border-[1.5px] font-mono text-[13px] font-bold",
            invalid ? "border-red-700 bg-red-50 text-red-700" : filled ? "border-ink bg-ink text-canvas" : "border-ink bg-card text-ink",
          )}
        >
          {invalid ? "!" : filled ? "✓" : String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h2 id={`section-${section.id}-title`} className="font-display text-[24px] leading-none text-ink">
            {section.title}
          </h2>
          <p className="mt-1 text-[13.5px] text-muted">{section.hint}</p>
        </div>
      </header>
      <div className="min-w-0 rounded-[8px] border-[1.5px] border-ink bg-card p-4 sm:p-6">{children}</div>
    </section>
  );
}

type InviteEditorProps = {
  inviteId: string | null;
  defaults: InviteFormValues;
  answered: boolean;
  themes: ThemeChoice[];
  uploadsEnabled: boolean;
  /**
   * Buy a locked Theme without leaving the form. Call `select` once it's
   * unlocked to switch the invite to it.
   */
  onUnlockTheme?: ((theme: ThemeChoice, select: () => void) => void) | undefined;
};

export function InviteEditor({ inviteId, defaults, answered, themes, uploadsEnabled, onUnlockTheme }: InviteEditorProps) {
  const router = useRouter();
  const isNew = inviteId === null;
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(false);
  const [moreDetails, setMoreDetails] = useState(() =>
    EXTRA_PLAN_FIELDS.some((f) => (f === "planPhotos" ? defaults.planPhotos.length > 0 : !!defaults[f])),
  );

  const {
    register,
    control,
    handleSubmit,
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

  const lockNote = "Locked, because they've already answered.";
  const filledCount = SECTIONS.filter((s) => isFilled(s.id, values)).length;

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

  // Show the first section with a problem; inputs get focus from React Hook Form.
  const onInvalid = (errs: FieldErrors<InviteFormValues>) => {
    if (EXTRA_PLAN_FIELDS.some((f) => f in errs)) setMoreDetails(true);
    const first = SECTIONS.find((s) => hasError(errs, s.fields));
    if (first) document.getElementById(`section-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-10">
        {answered && <Note>They&apos;ve answered, so the question, times and theme are locked. You can still change the plan.</Note>}

        <Section index={0} section={SECTIONS[0]!} filled={isFilled("ask", values)} invalid={hasError(errors, SECTIONS[0]!.fields)}>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
            <Field label="Who is it for?" hint="Their first name. Only you see it (and your Telegram)." error={errors.recipientName?.message}>
              <Input {...register("recipientName")} aria-invalid={!!errors.recipientName || undefined} placeholder="e.g. Sreyneang" autoComplete="off" />
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
        </Section>

        <Section index={1} section={SECTIONS[1]!} filled={isFilled("plan", values)} invalid={hasError(errors, SECTIONS[1]!.fields)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Where" error={errors.planPlace?.message}>
              <Input {...register("planPlace")} placeholder="mauu steak" />
            </Field>
            <Field label="What you'll do" optional error={errors.planActivity?.message}>
              <Input {...register("planActivity")} placeholder="steak dinner" />
            </Field>

            {!moreDetails ? (
              <button
                type="button"
                onClick={() => setMoreDetails(true)}
                className="justify-self-start text-[13.5px] text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink sm:col-span-2"
              >
                + Map link, dress code, notes, photos
              </button>
            ) : (
              <>
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
                  <p className="mb-1 flex items-baseline gap-2 text-[14px] font-medium text-ink">
                    Photos of the place <span className="font-mono text-[11px] font-normal tracking-wide text-faint">optional, up to {MAX_PLAN_PHOTOS}</span>
                  </p>
                  <p className="mb-3 text-[12.5px] text-muted">The first one is shown big; the others get a small caption.</p>
                  <div className="grid gap-3">
                    {photos.fields.map((photo, i) => (
                      <div key={photo.id} className="rounded-[6px] border-[1.5px] border-dashed border-ink/30 p-3">
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
                        {errors.planPhotos?.[i]?.url && <FieldError>{errors.planPhotos[i]?.url?.message}</FieldError>}
                        {i > 0 && <Input {...register(`planPhotos.${i}.caption`)} placeholder="caption, e.g. the vibe ✦" className="mt-3" />}
                      </div>
                    ))}
                  </div>
                  {photos.fields.length < MAX_PLAN_PHOTOS && (
                    <Button variant="secondary" size="sm" className="mt-3" onClick={() => photos.append({ url: "", alt: "", caption: "" })}>
                      + Add a photo
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </Section>

        <Section index={2} section={SECTIONS[2]!} filled={isFilled("when", values)} invalid={hasError(errors, SECTIONS[2]!.fields)}>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
            <TimesField
              slots={values.timeSlots ?? []}
              timezone={values.timezone}
              onAdd={(s) => slots.append(s)}
              onRemove={(i) => slots.remove(i)}
              disabled={answered}
              max={MAX_TIME_SLOTS}
            />
            {(errors.timeSlots?.message || errors.timeSlots?.root?.message) && (
              <FieldError className="-mt-3">{errors.timeSlots?.message ?? errors.timeSlots?.root?.message}</FieldError>
            )}

            <Checkbox
              {...register("allowCustomTime")}
              disabled={answered}
              label="Let them suggest a time too"
              description="They get a calendar and can pick any day and time, as well as your offers."
            />

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t-[1.5px] border-dashed border-ink/20 pt-4 text-[13px] text-muted">
              <span>
                Times are in <b className="font-medium text-ink">{values.timezone.replace(/_/g, " ")}</b>, wherever they open the link.
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
            {answered && <p className="text-[12.5px] text-muted">{lockNote}</p>}
          </div>
        </Section>

        <Section index={3} section={SECTIONS[3]!} filled={isFilled("look", values)} invalid={hasError(errors, SECTIONS[3]!.fields)}>
          <Controller
            control={control}
            name="themeId"
            render={({ field }) => (
              <ThemeField
                themes={themes}
                value={field.value}
                savedThemeId={defaults.themeId}
                onChange={field.onChange}
                onUnlock={onUnlockTheme && ((theme) => onUnlockTheme(theme, () => setValue("themeId", theme.id, { shouldDirty: true })))}
                disabled={answered}
              />
            )}
          />
          {errors.themeId && <FieldError className="mt-2">{errors.themeId.message}</FieldError>}
          {answered && <p className="mt-3 text-[12.5px] text-muted">{lockNote}</p>}
        </Section>

        {/* One place to finish, always in reach */}
        <div className="sticky bottom-0 z-20 -mx-4 flex items-center gap-2 border-t-[1.5px] border-ink bg-canvas px-4 py-3 sm:mx-0 sm:rounded-[8px] sm:border-[1.5px] sm:bg-card sm:shadow-[4px_4px_0_var(--color-ink)]">
          <p className="hidden font-mono text-[12px] text-muted sm:block">
            {filledCount}/{SECTIONS.length} done
          </p>
          <Button variant="secondary" className="lg:hidden" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>

          <div className="ml-auto flex min-w-0 items-center gap-3">
            {serverError && (
              <p role="alert" className="min-w-0 text-[13px] font-medium text-red-700">
                {serverError}
              </p>
            )}
            {saved && !isDirty && !serverError && <p className="text-[13px] text-emerald-800">Saved ✓</p>}
            {isNew ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create invite →"}
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
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
