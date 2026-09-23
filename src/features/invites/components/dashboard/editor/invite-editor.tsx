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

type RowId = "plan" | "when" | "look" | "extras";

// The optional "Make it yours" layer: every field here already has a working default.
const ROWS: { id: RowId; title: string; fields: FieldPath<InviteFormValues>[] }[] = [
  { id: "plan", title: "The plan", fields: ["planPlace", "planActivity", "planMapUrl", "planDressCode", "planNotes", "planPhotos"] },
  { id: "when", title: "When", fields: ["timezone", "timeSlots", "allowCustomTime"] },
  { id: "look", title: "The look", fields: ["themeId"] },
  { id: "extras", title: "Note & picture", fields: ["message", "imageUrl"] },
];
const MAIN_FIELDS: FieldPath<InviteFormValues>[] = ["question", "recipientName"];

const hasError = (errors: FieldErrors<InviteFormValues>, fields: FieldPath<InviteFormValues>[]) =>
  fields.some((f) => f.split(".")[0]! in errors);

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** One line, in plain words, saying what the Recipient gets from a row right now. */
function summarise(id: RowId, v: InviteFormValues, themes: ThemeChoice[]): string {
  switch (id) {
    case "plan": {
      const main = [v.planPlace?.trim(), v.planActivity?.trim()].filter(Boolean).join(" · ");
      const extras = [v.planMapUrl, v.planDressCode, v.planNotes].filter((x) => x?.trim()).length + (v.planPhotos?.length ?? 0);
      if (main) return extras ? `${main} + ${count(extras, "detail", "details")}` : main;
      return extras ? count(extras, "detail", "details") : "No plan yet: it stays a surprise";
    }
    case "when": {
      const n = v.timeSlots?.length ?? 0;
      if (n === 0) return v.allowCustomTime ? "They suggest a time" : "Offer a time, or let them suggest one";
      return `${count(n, "time", "times")} offered${v.allowCustomTime ? ", or they suggest one" : ""}`;
    }
    case "look":
      return themes.find((t) => t.id === v.themeId)?.name ?? "Pick a theme";
    case "extras": {
      const note = v.message?.trim();
      const picture = v.imageUrl?.trim() ? "your picture" : "the kitten picture";
      return note ? `“${note}” · ${picture}` : `No note · ${picture}`;
    }
  }
}

function Row({
  row,
  summary,
  open,
  invalid,
  locked,
  onToggle,
  children,
}: {
  row: (typeof ROWS)[number];
  summary: string;
  open: boolean;
  invalid: boolean;
  locked?: boolean | undefined;
  onToggle: () => void;
  children: ReactNode;
}) {
  const bodyId = `row-${row.id}`;
  return (
    <div id={`section-${row.id}`} className="scroll-mt-20">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-surface/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose sm:px-5"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[15.5px] font-semibold text-ink">
            {row.title}
            {invalid && <span className="text-[12.5px] font-medium text-red-700">needs a look</span>}
            {locked && <span className="text-[12.5px] font-normal text-muted">locked</span>}
          </span>
          <span className="mt-0.5 block truncate text-[14px] text-muted">{summary}</span>
        </span>
        <span
          aria-hidden
          className={cx(
            "grid size-7 shrink-0 place-items-center rounded-[5px] border-[1.5px] text-[16px] leading-none transition",
            open ? "border-ink bg-ink text-canvas" : "border-ink/25 text-ink",
          )}
        >
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div id={bodyId} className="min-w-0 px-4 pt-1 pb-5 sm:px-5">
          {children}
        </div>
      )}
    </div>
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
  const [open, setOpen] = useState<Set<RowId>>(() => new Set());

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

  const toggle = (id: RowId) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const lockNote = "Locked, because they've already answered.";

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

  // Open every row with a problem and bring the first one into view.
  const onInvalid = (errs: FieldErrors<InviteFormValues>) => {
    const broken = ROWS.filter((r) => hasError(errs, r.fields)).map((r) => r.id);
    if (broken.length) setOpen((prev) => new Set([...prev, ...broken]));
    const first = hasError(errs, MAIN_FIELDS) ? "main" : broken[0];
    if (first) requestAnimationFrame(() => document.getElementById(`section-${first}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const row = (id: RowId) => {
    const r = ROWS.find((x) => x.id === id)!;
    return {
      row: r,
      summary: summarise(id, values, themes),
      open: open.has(id),
      invalid: hasError(errors, r.fields),
      onToggle: () => toggle(id),
    };
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8">
        {answered && <Note>They&apos;ve answered, so the question, times and theme are locked. You can still change the plan.</Note>}

        {/* The only part that matters: already filled in, ready to send */}
        <section id="section-main" aria-label="Your question" className="scroll-mt-20 rounded-[8px] border-[1.5px] border-ink bg-card p-4 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
            <Controller
              control={control}
              name="question"
              render={({ field }) => (
                <QuestionField value={field.value} onChange={field.onChange} disabled={answered} error={errors.question?.message ?? (answered ? lockNote : undefined)} />
              )}
            />
            <Field label="Who is it for?" optional hint="Only you see it: in your invites list and your Telegram messages." error={errors.recipientName?.message}>
              <Input {...register("recipientName")} aria-invalid={!!errors.recipientName || undefined} placeholder="e.g. Sreyneang" autoComplete="off" />
            </Field>
          </div>
        </section>

        <section aria-labelledby="make-it-yours">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="make-it-yours" className="font-display text-[24px] leading-none text-ink">
              Make it yours
            </h2>
            <p className="text-[13.5px] text-muted">All optional</p>
          </div>

          <div className="divide-y-[1.5px] divide-ink/15 overflow-hidden rounded-[8px] border-[1.5px] border-ink bg-card">
            <Row {...row("plan")}>
              <p className="mb-4 text-[13.5px] text-muted">What they see after they say yes. Leave it empty to keep it a surprise.</p>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
                <Field label="Where" optional error={errors.planPlace?.message}>
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
                  <p className="mb-1 flex items-baseline gap-2 text-[14px] font-medium text-ink">
                    Photos of the place <span className="text-[12.5px] font-normal text-faint">optional, up to {MAX_PLAN_PHOTOS}</span>
                  </p>
                  <p className="mb-3 text-[12.5px] text-muted">The first one is shown big; the others get a small caption.</p>
                  <div className="grid gap-3">
                    {photos.fields.map((photo, i) => (
                      <div key={photo.id} className="rounded-[6px] border-[1.5px] border-dashed border-ink/30 p-3">
                        <Controller
                          control={control}
                          name={`planPhotos.${i}.url`}
                          render={({ field }) => (
                            <ImageField value={field.value} onChange={(url) => (url ? field.onChange(url) : photos.remove(i))} uploadsEnabled={uploadsEnabled} />
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
              </div>
            </Row>

            <Row {...row("when")} locked={answered}>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
                <Checkbox
                  {...register("allowCustomTime")}
                  disabled={answered}
                  label="Let them suggest a time"
                  description="They get a calendar and can pick any day and time. On by default, so you don't have to offer any."
                />
                <div>
                  <p className="mb-3 text-[13.5px] text-muted">Or offer specific times as well:</p>
                  <TimesField
                    slots={values.timeSlots ?? []}
                    timezone={values.timezone}
                    onAdd={(s) => slots.append(s)}
                    onRemove={(i) => slots.remove(i)}
                    disabled={answered}
                    max={MAX_TIME_SLOTS}
                  />
                </div>
                {(errors.timeSlots?.message || errors.timeSlots?.root?.message) && (
                  <FieldError className="-mt-3">{errors.timeSlots?.message ?? errors.timeSlots?.root?.message}</FieldError>
                )}

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
              </div>
            </Row>

            <Row {...row("look")} locked={answered}>
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
            </Row>

            <Row {...row("extras")}>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
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
            </Row>
          </div>
        </section>

        {/* One place to finish, always in reach */}
        <div className="sticky bottom-0 z-20 -mx-4 flex items-center gap-2 border-t-[1.5px] border-ink bg-canvas px-4 py-3 sm:mx-0 sm:rounded-[8px] sm:border-[1.5px] sm:bg-card sm:shadow-[4px_4px_0_var(--color-ink)]">
          <Button variant="secondary" className="lg:hidden" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <p className="hidden text-[13.5px] text-muted lg:block">{isNew ? "Ready to send as it is." : "Changes show up on their link right away."}</p>

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
