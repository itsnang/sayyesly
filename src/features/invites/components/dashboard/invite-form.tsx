"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button, Card, Field, Input, Textarea } from "@/components/shared/ui";
import { formatUsd } from "@/lib/format";
import { saveInvite } from "../../actions";
import { inviteFormSchema, MAX_PLAN_PHOTOS, MAX_TIME_SLOTS, type InviteFormValues } from "../../schemas";
import type { ThemeChoice } from "../../server/theme-access";
import { ImageField } from "./image-field";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "../theme-preview-protocol";

type InviteFormProps = {
  inviteId: string | null;
  defaults: InviteFormValues;
  answered: boolean;
  themes: ThemeChoice[];
  uploadsEnabled: boolean;
};

export function InviteForm({ inviteId, defaults, answered, themes, uploadsEnabled }: InviteFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: defaults,
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;
  const slots = useFieldArray({ control, name: "timeSlots" });
  const photos = useFieldArray({ control, name: "planPhotos" });

  const timeZones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return ["Asia/Phnom_Penh"];
    }
  }, []);

  // Live preview: the iframe asks for data when it's ready, then gets every change.
  const iframe = useRef<HTMLIFrameElement>(null);
  const values = useWatch({ control }) as InviteFormValues;
  useEffect(() => {
    const post = () =>
      iframe.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, values }, window.location.origin);
    post();
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === PREVIEW_READY) post();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [values]);

  async function onSubmit(data: InviteFormValues) {
    setServerError(null);
    setSaved(false);
    const result = await saveInvite(inviteId, data);
    if (result.error || !result.id) {
      setServerError(result.error ?? "Couldn't save. Please try again.");
      return;
    }
    if (!inviteId) {
      router.push(`/dashboard/invites/${result.id}`);
      return;
    }
    reset(data);
    setSaved(true);
    router.refresh();
  }

  const lockNote = answered ? "Locked: this invite already has an answer." : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        <Card>
          <h2 className="mb-4 text-lg text-[var(--ink)]">the question</h2>
          <div className="grid gap-4">
            <Field label="Who is it for?" hint="Their name. It appears in your Telegram notification, not on the link preview." error={errors.recipientName?.message}>
              <Input {...register("recipientName")} placeholder="e.g. Sreyneang" autoComplete="off" />
            </Field>
            <Field
              label="Your question"
              hint={lockNote ?? "Wrap one word in *stars* to underline it: will you have *dinner* with me?"}
              error={errors.question?.message}
            >
              <Input {...register("question")} disabled={answered} />
            </Field>
            <Field label="A little message (optional)" error={errors.message?.message}>
              <Textarea {...register("message")} rows={2} placeholder="no pressure :)" />
            </Field>
            <Field label="Picture at the top (optional)" hint="Leave empty for the kitten." error={errors.imageUrl?.message}>
              <Controller
                control={control}
                name="imageUrl"
                render={({ field }) => (
                  <ImageField value={field.value} onChange={field.onChange} uploadsEnabled={uploadsEnabled} />
                )}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg text-[var(--ink)]">the plan</h2>
          <p className="-mt-3 mb-4 text-xs text-[var(--ink-soft)]">Revealed after they say yes. You can keep editing it later.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Place" error={errors.planPlace?.message}>
              <Input {...register("planPlace")} placeholder="mauu steak" />
            </Field>
            <Field label="What you'll do" error={errors.planActivity?.message}>
              <Input {...register("planActivity")} placeholder="steakhouse dinner" />
            </Field>
            <Field label="Map link" error={errors.planMapUrl?.message} className="sm:col-span-2">
              <Input {...register("planMapUrl")} type="url" inputMode="url" placeholder="https://maps.app.goo.gl/…" />
            </Field>
            <Field label="Dress code" error={errors.planDressCode?.message}>
              <Input {...register("planDressCode")} placeholder="comfy" />
            </Field>
            <Field label="Notes" error={errors.planNotes?.message}>
              <Input {...register("planNotes")} placeholder="I'll pick you up at 6:45" />
            </Field>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-[var(--ink)]">Photos of the place (up to {MAX_PLAN_PHOTOS})</p>
            <div className="grid gap-3">
              {photos.fields.map((photo, i) => (
                <div key={photo.id} className="grid gap-2 rounded-xl bg-[var(--paper-2)]/60 p-3">
                  <Controller
                    control={control}
                    name={`planPhotos.${i}.url`}
                    render={({ field }) => (
                      <ImageField value={field.value} onChange={field.onChange} uploadsEnabled={uploadsEnabled} />
                    )}
                  />
                  {errors.planPhotos?.[i]?.url && (
                    <p className="text-xs text-red-700">{errors.planPhotos[i]?.url?.message}</p>
                  )}
                  <div className="flex gap-2">
                    <Input {...register(`planPhotos.${i}.caption`)} placeholder={i === 0 ? "caption (not shown on the big photo)" : "caption, e.g. the vibe ✦"} />
                    <Button type="button" variant="ghost" onClick={() => photos.remove(i)} aria-label="remove photo">
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {photos.fields.length < MAX_PLAN_PHOTOS && (
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={() => photos.append({ url: "", alt: "", caption: "" })}
              >
                + add a photo
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg text-[var(--ink)]">when</h2>
          {answered && <p className="-mt-2 mb-3 text-xs text-[var(--ink-soft)]">{lockNote}</p>}
          <div className="grid gap-4">
            <Field label="Time zone" hint="Times are shown in this zone, wherever they open the link." error={errors.timezone?.message}>
              <Input {...register("timezone")} list="time-zones" disabled={answered} />
              <datalist id="time-zones">
                {timeZones.map((tz) => (
                  <option key={tz} value={tz} />
                ))}
              </datalist>
            </Field>

            <div>
              <p className="mb-2 text-sm text-[var(--ink)]">Times you offer</p>
              <div className="grid gap-2">
                {slots.fields.map((slot, i) => (
                  <div key={slot.id} className="flex flex-wrap items-center gap-2">
                    <Input type="date" {...register(`timeSlots.${i}.date`)} disabled={answered} className="w-auto flex-1" />
                    <Input type="time" {...register(`timeSlots.${i}.time`)} disabled={answered} className="w-auto flex-1" />
                    {!answered && (
                      <Button type="button" variant="ghost" onClick={() => slots.remove(i)} aria-label="remove time">
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {(errors.timeSlots?.message || errors.timeSlots?.root?.message) && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  {errors.timeSlots?.message ?? errors.timeSlots?.root?.message}
                </p>
              )}
              {!answered && slots.fields.length < MAX_TIME_SLOTS && (
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => slots.append({ date: "", time: "19:00" })}
                >
                  + add a time
                </Button>
              )}
            </div>

            <label className="flex items-start gap-3 text-sm text-[var(--ink)]">
              <input type="checkbox" {...register("allowCustomTime")} disabled={answered} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
              <span>
                Let them suggest their own date and time
                <span className="block text-xs text-[var(--ink-soft)]">They pick a day on a calendar and a time.</span>
              </span>
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg text-[var(--ink)]">theme</h2>
          {answered && <p className="-mt-2 mb-3 text-xs text-[var(--ink-soft)]">{lockNote}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {themes.map((theme) => {
              const current = defaults.themeId === theme.id;
              const selectable = !answered && (theme.usable || current);
              return (
                <label
                  key={theme.id}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 ${
                    values.themeId === theme.id ? "border-[var(--accent)] bg-[var(--paper-2)]" : "border-[var(--line)]/30"
                  } ${selectable ? "cursor-pointer" : "opacity-70"}`}
                >
                  <input type="radio" value={theme.id} {...register("themeId")} disabled={!selectable} className="accent-[var(--accent)]" />
                  <span className="flex-1 text-sm text-[var(--ink)]">{theme.name}</span>
                  {theme.priceCents === 0 ? (
                    <span className="text-xs text-[var(--ink-soft)]">free</span>
                  ) : theme.usable ? (
                    <span className="text-xs text-emerald-700">unlocked</span>
                  ) : (
                    <Link href="/dashboard/themes" className="text-xs text-[var(--accent)] underline">
                      🔒 {formatUsd(theme.priceCents)}
                    </Link>
                  )}
                </label>
              );
            })}
          </div>
          {errors.themeId && <p className="mt-1 text-xs text-red-700">{errors.themeId.message}</p>}
        </Card>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t-2 border-[var(--line)]/15 bg-[var(--paper)]/95 px-4 py-3 backdrop-blur">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "saving…" : inviteId ? "save changes" : "create invite ✦"}
          </Button>
          <Button type="button" variant="secondary" className="lg:hidden" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "hide preview" : "preview"}
          </Button>
          {serverError && (
            <p role="alert" className="text-sm text-red-700">
              {serverError}
            </p>
          )}
          {saved && !isDirty && <p className="text-sm text-emerald-700">saved ✓</p>}
          {Object.keys(errors).length > 0 && !serverError && (
            <p className="text-sm text-red-700">Please fix the highlighted fields.</p>
          )}
        </div>
      </form>

      <aside className={`${showPreview ? "block" : "hidden"} lg:block`}>
        <div className="lg:sticky lg:top-20">
          <p className="mb-2 text-center text-xs text-[var(--ink-soft)]">live preview · answers aren&apos;t saved</p>
          <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[28px] border-4 border-[var(--ink)]/80 bg-white shadow-lg">
            <iframe
              ref={iframe}
              src="/preview/theme"
              title="Invite preview"
              className="block h-[700px] w-full"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
