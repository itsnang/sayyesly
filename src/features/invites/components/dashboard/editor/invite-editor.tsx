"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Controller, useFieldArray, useForm, useWatch, type FieldErrors, type FieldPath } from "react-hook-form";
import { Wordmark } from "@/components/shared/studio";
import { Button, buttonClass, chipClass, cx, Field, FieldError, Input, Note, Textarea } from "@/components/shared/ui";
import { formatUsd } from "@/lib/format";
import { track } from "@/lib/analytics/track";
import { errorMessage } from "@/lib/query/action";
import { useSaveInvite } from "../../../hooks/use-invite-mutations";
import { inviteFormSchema, MAX_PLAN_PHOTOS, MAX_TIME_SLOTS, type InviteFormValues } from "../../../schemas";
import type { ThemeChoice } from "../../../server/theme-access";
import type { ThemeContent } from "../../../themes";
import { kittenSoftContent } from "../../../themes/kitten-soft";
import { timeLabel } from "../../../themes/shared/format";
import { inviteTitle } from "../../../utils";
import { withExample } from "../../../utils/example";
import { DEFAULT_TIME_OF_DAY, TIME_OF_DAY_LABELS, TIMES_OF_DAY, timesFor } from "../../../utils/time-of-day";
import { ImageField } from "../image-field";
import { DesktopMock, DeviceToggle, PhoneMock, PreviewSheet } from "./live-preview";
import { QuestionField } from "./question-field";
import { isThemeLocked, ThemeField } from "./theme-field";
import { PhotosField } from "./photos-field";
import { DEFAULT_SONG_LENGTH, recognizeSong, songFromUrl } from "../../../utils/song";
import { SongDetails } from "./song-details";
import { SongPartPicker } from "./song-part-picker";
import { TimesField } from "./times-field";
import { TimeZoneSelect } from "./time-zone-select";
import { useShallow } from "zustand/react/shallow";
import { useStudio, type SectionId } from "../../../stores/studio-store";

// The optional layer: every field here already has a working default.
const SECTIONS: { id: SectionId; title: string; fields: FieldPath<InviteFormValues>[] }[] = [
  { id: "plan", title: "Plan", fields: ["planPlace", "planActivity", "planMapUrl", "planDressCode", "planNotes", "planPhotos"] },
  { id: "when", title: "When", fields: ["timezone", "timeSlots", "allowCustomTime", "timeOfDay"] },
  { id: "extras", title: "Extras", fields: ["message", "imageUrl", "songUrl"] },
];
const MAIN_FIELDS: FieldPath<InviteFormValues>[] = ["question", "recipientName", "themeId"];

// Used only if the selected Theme is missing from the list: show everything, name nothing theme-specific.
const ALL_CONTENT: ThemeContent = {
  question: { label: "Question" },
  picture: { label: "Picture", whenEmpty: "the theme's own picture" },
  note: true,
  planPhotos: true,
  song: true,
  example: kittenSoftContent.example,
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** The Extras section's name, after what the selected Theme actually shows, e.g. "Note, picture & song" (null: nothing to set). */
function extrasTitle(content: ThemeContent): string | null {
  const names = [content.note && "note", content.picture && "picture", content.song && "song"].filter((n): n is string => !!n);
  if (names.length === 0) return null;
  const title = names.length === 1 ? names[0]! : `${names.slice(0, -1).join(", ")} & ${names.at(-1)!}`;
  return capitalize(title);
}

const hasError = (errors: FieldErrors<InviteFormValues>, fields: FieldPath<InviteFormValues>[]) =>
  fields.some((f) => f.split(".")[0]! in errors);

/** True only in the browser (false during server rendering and hydration), for portals into document.body. */
const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** One short line saying what the Recipient gets from a section right now. */
function summarise(id: SectionId, v: InviteFormValues, content: ThemeContent): string {
  switch (id) {
    case "plan": {
      const main = [v.planPlace?.trim(), v.planActivity?.trim()].filter(Boolean).join(" · ");
      const photos = content.planPhotos ? (v.planPhotos?.length ?? 0) : 0;
      const extras = [v.planMapUrl, v.planDressCode, v.planNotes].filter((x) => x?.trim()).length + photos;
      if (main) return extras ? `${main} +${extras}` : main;
      return extras ? count(extras, "detail", "details") : "A surprise";
    }
    case "when": {
      if (v.allowCustomTime) return `They pick · ${TIME_OF_DAY_LABELS[v.timeOfDay ?? DEFAULT_TIME_OF_DAY]}`;
      const n = v.timeSlots?.length ?? 0;
      return n === 0 ? "Needs a time" : count(n, "time", "times");
    }
    case "extras": {
      const parts: string[] = [];
      if (content.note && v.message?.trim()) parts.push(`“${v.message.trim()}”`);
      if (content.picture) {
        // What they'll actually get, e.g. "Just the letter" (the preview may be showing an example photo).
        const empty = content.picture.whenEmpty;
        parts.push(v.imageUrl?.trim() ? "Your picture" : capitalize(empty));
      }
      if (content.song && v.songUrl?.trim() && recognizeSong(v.songUrl).ok) parts.push("♪ Song");
      return parts.join(" · ") || "None";
    }
  }
}

function Section({
  title,
  summary,
  open,
  invalid,
  locked,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  open: boolean;
  invalid: boolean;
  locked?: boolean | undefined;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-ink/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-surface/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose"
      >
        <span className="w-24 shrink-0 text-[14px] font-medium text-ink">{title}</span>
        <span className={cx("min-w-0 flex-1 truncate text-right text-[13.5px]", invalid ? "font-medium text-red-700" : "text-muted")}>
          {invalid ? "Needs a look" : locked ? `${summary} · locked` : summary}
        </span>
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className={cx("size-4 shrink-0 text-faint transition-transform", open && "rotate-90")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3.5 10.5 8 6 12.5" />
        </svg>
      </button>
      {open && <div className="min-w-0 px-5 pt-1 pb-6">{children}</div>}
    </div>
  );
}

type InviteEditorProps = {
  inviteId: string | null;
  defaults: InviteFormValues;
  answered: boolean;
  themes: ThemeChoice[];
  uploadsEnabled: boolean;
  /** The Share drawer's content (link, group chats); only for saved invites */
  share?: ReactNode;
  /** Shown at the very end of the settings, e.g. deleting the invite */
  footer?: ReactNode;
  /** A one-off notice above the question, e.g. a duplicated Invite's Theme changing */
  notice?: ReactNode;
};

/**
 * The invite studio: the live invite on a canvas (phone or desktop) and one
 * column of settings beside it. The question is always open; every optional
 * section is a single line with its current value until you open it.
 * Its screen state (sections, device, drawers, checkout) is the studio store's;
 * render it inside StudioStoreProvider.
 */
export function InviteEditor({ inviteId, defaults, answered, themes, uploadsEnabled, share, footer, notice }: InviteEditorProps) {
  const router = useRouter();
  const isNew = inviteId === null;
  const { openSections, device, previewOpen, sharing, editingZone } = useStudio(
    useShallow((s) => ({ openSections: s.openSections, device: s.device, previewOpen: s.previewOpen, sharing: s.sharing, editingZone: s.editingZone })),
  );
  const { toggleSection, revealSections, setDevice, setPreviewOpen, setSharing, toggleEditingZone, openCheckout } = useStudio(
    useShallow((s) => ({
      toggleSection: s.toggleSection,
      revealSections: s.revealSections,
      setDevice: s.setDevice,
      setPreviewOpen: s.setPreviewOpen,
      setSharing: s.setSharing,
      toggleEditingZone: s.toggleEditingZone,
      openCheckout: s.openCheckout,
    })),
  );
  // Only about the last save, so it stays with the form.
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const isClient = useIsClient();
  const save = useSaveInvite(inviteId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
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

  // "Offer a time or let them pick" spans two fields: re-check it as soon as either changes.
  const slotCount = values.timeSlots?.length ?? 0;
  const timesError = !!errors.timeSlots;
  useEffect(() => {
    if (timesError) void trigger("timeSlots");
  }, [slotCount, values.allowCustomTime, timesError, trigger]);

  // The selected Theme decides which optional fields are worth asking for.
  const content = themes.find((t) => t.id === values.themeId)?.content ?? ALL_CONTENT;
  const extras = extrasTitle(content);
  // The preview fills what's still empty from the Theme's example, so the Creator sees what it can hold.
  const preview = useMemo(() => withExample(values, content), [values, content]);
  const exampleTag = preview.filled.length > 0 && <ExampleTag filled={preview.filled} />;
  // A paid Theme can be tried on the preview before buying; it has to be unlocked to save.
  const selectedTheme = themes.find((t) => t.id === values.themeId);
  const themeLocked = isThemeLocked(selectedTheme, defaults.themeId);
  // The Song and the part of it that plays: a different song starts from its beginning again.
  const songLink = songFromUrl(values.songUrl);
  const songId = songLink?.id ?? null;
  const lastSongId = useRef(songId);
  useEffect(() => {
    if (songId && lastSongId.current && songId !== lastSongId.current) setValue("songStart", 0, { shouldDirty: true });
    lastSongId.current = songId ?? lastSongId.current;
  }, [songId, setValue]);
  const setSongPart = useCallback(
    (start: number, length: number, byCreator: boolean) => {
      setValue("songStart", start, { shouldDirty: byCreator });
      setValue("songLength", length, { shouldDirty: byCreator });
    },
    [setValue],
  );
  // Buy a locked Theme without leaving the form; once it's paid, the Invite switches to it.
  const unlock = (theme: ThemeChoice) => openCheckout(theme, () => setValue("themeId", theme.id, { shouldDirty: true }));
  const title = isNew ? "New invite" : inviteTitle(values.recipientName ?? "", values.question ?? "");
  const lockNote = "Locked, because they've already answered.";

  const section = (id: SectionId) => {
    const s = SECTIONS.find((x) => x.id === id)!;
    return {
      title: id === "extras" && extras ? extras : s.title,
      summary: summarise(id, values, content),
      open: openSections.includes(id),
      invalid: hasError(errors, s.fields),
      onToggle: () => toggleSection(id),
    };
  };

  async function onSubmit(data: InviteFormValues) {
    setServerError(null);
    setSaved(false);
    if (themeLocked && selectedTheme) {
      unlock(selectedTheme);
      return;
    }
    let result;
    try {
      result = await save.mutateAsync(data);
    } catch (error) {
      setServerError(errorMessage(error));
      return;
    }
    if (isNew) {
      track("invite_created", { theme: data.themeId });
      router.push(`/dashboard/invites/${result.id}?created=1`);
      return;
    }
    if (result.answered && !answered) {
      // They answered while this was open: only the Plan was saved. Reload the
      // page (it remounts the form with the locked fields) and say why.
      router.replace(`/dashboard/invites/${result.id}?answeredWhileEditing=1`);
      return;
    }
    reset(data);
    setSaved(true);
    router.refresh();
  }

  // Open every section with a problem; React Hook Form focuses the first field.
  const onInvalid = (errs: FieldErrors<InviteFormValues>) => {
    const broken = SECTIONS.filter((s) => hasError(errs, s.fields)).map((s) => s.id);
    if (broken.length) revealSections(broken);
    if (!hasError(errs, MAIN_FIELDS) && broken[0]) {
      requestAnimationFrame(() => document.getElementById(`section-${broken[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
  };

  const status = serverError ? (
    <span role="alert" className="truncate text-[13px] font-medium text-red-700">
      {serverError}
    </span>
  ) : saved && !isDirty ? (
    <span className="text-[13px] text-emerald-800">Saved</span>
  ) : !isNew && isDirty ? (
    <span className="text-[13px] text-muted">Unsaved changes</span>
  ) : null;

  // Unlocking buys the Theme, not the invite, so it opens checkout without checking the form's fields.
  const primary =
    themeLocked && selectedTheme ? (
      <Button type="button" size="sm" onClick={() => unlock(selectedTheme)}>
        Unlock {formatUsd(selectedTheme.priceCents)}
      </Button>
    ) : isNew ? (
      <Button type="submit" form="invite-form" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create invite"}
      </Button>
    ) : (
      <Button type="submit" form="invite-form" size="sm" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? "Saving…" : "Save"}
      </Button>
    );

  return (
    <div className="flex min-h-dvh flex-col bg-white lg:h-dvh">
      {/* The only bar */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-ink/10 bg-white/95 px-4 backdrop-blur lg:static">
        <Link href="/dashboard" aria-label="All invites" className="shrink-0">
          <Wordmark className="h-9 w-auto max-sm:hidden" />
          <span className="text-[18px] text-ink sm:hidden">←</span>
        </Link>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[14px] sm:border-l sm:border-ink/10 sm:pl-3">
          <Link href="/dashboard" className="shrink-0 text-muted hover:text-ink max-sm:hidden">
            Invites
          </Link>
          <span aria-hidden className="text-faint max-sm:hidden">
            /
          </span>
          <span className="truncate font-medium text-ink">{title}</span>
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-2.5">
          {status}
          {share && (
            <button type="button" onClick={() => setSharing(true)} className={buttonClass("secondary", "sm")}>
              Share
            </button>
          )}
          <div className="max-lg:hidden">{primary}</div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Canvas (right on large screens): the invite is the hero */}
        <div className="hidden min-w-0 flex-1 flex-col bg-stage lg:flex">
          <div className="flex shrink-0 items-center justify-center gap-3 p-4">
            <DeviceToggle value={device} onChange={setDevice} />
            {themeLocked && selectedTheme && (
              <button type="button" onClick={() => unlock(selectedTheme)} className={buttonClass("primary", "sm")}>
                Unlock {selectedTheme.name} · {formatUsd(selectedTheme.priceCents)}
              </button>
            )}
          </div>
          <div className="grid min-h-0 flex-1 place-items-center px-8">
            {device === "phone" ? (
              <PhoneMock values={preview.values} className="h-full max-h-[780px]" />
            ) : (
              <DesktopMock values={preview.values} className="w-[min(100%,1100px,calc((100dvh-10rem)*1.6))]" />
            )}
          </div>
          <div className="flex h-14 shrink-0 items-center justify-center px-8">{exampleTag}</div>
        </div>

        {/* Settings */}
        <form
          id="invite-form"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          noValidate
          className="min-w-0 flex-1 pb-24 lg:order-first lg:w-[400px] lg:flex-none lg:overflow-y-auto lg:border-r lg:border-ink/10 lg:pb-0"
        >
          {notice && <div className="px-5 pt-5">{notice}</div>}
          {answered && (
            <div className="px-5 pt-5">
              <Note>They&apos;ve answered, so the question, times and theme are locked. You can still change the plan.</Note>
            </div>
          )}

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
                  error={errors.question?.message ?? (answered ? lockNote : undefined)}
                />
              )}
            />
            <Field label="For" optional hint="Only you see this, in your list and Telegram messages." error={errors.recipientName?.message}>
              <Input {...register("recipientName")} aria-invalid={!!errors.recipientName || undefined} placeholder="Their name" autoComplete="off" />
            </Field>
          </div>

          {/* Themes are what we sell: always in view, and every one can be tried on the preview */}
          <div id="section-theme" className="border-t border-ink/10 px-5 pt-5 pb-6">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-[13.5px] font-medium text-ink">Theme</h2>
              {answered ? (
                <span className="text-[12.5px] text-muted">Locked</span>
              ) : (
                <span className="text-[12.5px] text-muted">Tap to try one on</span>
              )}
            </div>
            <Controller
              control={control}
              name="themeId"
              render={({ field }) => (
                <ThemeField
                  themes={themes}
                  value={field.value}
                  savedThemeId={defaults.themeId}
                  onChange={field.onChange}
                  onUnlock={unlock}
                  disabled={answered}
                />
              )}
            />
            {errors.themeId && <FieldError className="mt-2">{errors.themeId.message}</FieldError>}
          </div>

          {/* Right after the Theme, which decides whether there's a note or picture at all */}
          {extras && (
            <div id="section-extras">
              <Section {...section("extras")}>
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
                  {content.song && (
                    <Field
                      label="Song"
                      optional
                      hint="Plays in the background once they tap. In YouTube: Share → Copy link."
                      error={errors.songUrl?.message}
                    >
                      <div className="grid gap-2">
                        <Input {...register("songUrl")} type="url" inputMode="url" placeholder="https://youtu.be/…" />
                        <SongDetails songUrl={values.songUrl ?? ""} />
                        {songLink && (
                          <SongPartPicker
                            key={songLink.id}
                            song={songLink}
                            start={values.songStart ?? 0}
                            length={values.songLength ?? DEFAULT_SONG_LENGTH}
                            onChange={setSongPart}
                          />
                        )}
                      </div>
                    </Field>
                  )}
                </div>
              </Section>
            </div>
          )}

          <div id="section-plan">
            <Section {...section("plan")}>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
                <p className="text-[13px] text-muted">Shown after they say yes. Leave it empty to keep it a surprise.</p>
                <Field label="Where" optional error={errors.planPlace?.message}>
                  <Input {...register("planPlace")} placeholder="the café by the river" />
                </Field>
                <Field label="What you'll do" optional error={errors.planActivity?.message}>
                  <Input {...register("planActivity")} placeholder="dinner, then a walk" />
                </Field>
                <Field label="Map link" optional hint="In Google Maps: Share → Copy link." error={errors.planMapUrl?.message}>
                  <Input {...register("planMapUrl")} type="url" inputMode="url" placeholder="https://maps.app.goo.gl/…" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Dress code" optional error={errors.planDressCode?.message}>
                    <Input {...register("planDressCode")} placeholder="comfy" />
                  </Field>
                  <Field label="Notes" optional error={errors.planNotes?.message}>
                    <Input {...register("planNotes")} placeholder="pick-up at 6:45" />
                  </Field>
                </div>

                {content.planPhotos && (
                  <div>
                    <p className="mb-2 flex items-baseline gap-2 text-[13.5px] font-medium text-ink">
                      Photos <span className="text-[12.5px] font-normal text-faint">optional, up to {MAX_PLAN_PHOTOS}</span>
                    </p>
                    <PhotosField
                      photos={photos.fields.map((f, i) => ({ key: f.id, url: values.planPhotos?.[i]?.url ?? "" }))}
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
          </div>

          <div id="section-when">
            <Section {...section("when")} locked={answered}>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
                <Controller
                  control={control}
                  name="allowCustomTime"
                  render={({ field }) => (
                    <div role="radiogroup" aria-label="Who picks the time" className="grid grid-cols-2 gap-1 rounded-[8px] border border-ink/15 bg-surface p-1">
                      {[
                        { value: true, label: "Let them pick" },
                        { value: false, label: "I'll pick the times" },
                      ].map((mode) => (
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

                {values.allowCustomTime ? (
                  <p className="text-[13px] leading-relaxed text-muted">
                    They get a calendar to choose a day, then a time from{" "}
                    <b className="font-medium text-ink">
                      {timeLabel(timesFor(values.timeOfDay)[0]!)} to {timeLabel(timesFor(values.timeOfDay).at(-1)!)}
                    </b>{" "}
                    or any other time they write in.
                  </p>
                ) : (
                  <TimesField
                    slots={values.timeSlots ?? []}
                    quickTimes={timesFor(values.timeOfDay)}
                    timezone={values.timezone}
                    onAdd={(s) => slots.append(s)}
                    onRemove={(i) => slots.remove(i)}
                    disabled={answered}
                    max={MAX_TIME_SLOTS}
                  />
                )}
                {(errors.timeSlots?.message || errors.timeSlots?.root?.message) && (
                  <FieldError className="-mt-2">{errors.timeSlots?.message ?? errors.timeSlots?.root?.message}</FieldError>
                )}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
                  <span>
                    Time zone: <b className="font-medium text-ink">{values.timezone.replace(/_/g, " ")}</b>
                  </span>
                  {!answered && (
                    <button type="button" onClick={() => toggleEditingZone} className="text-ink underline underline-offset-4">
                      {editingZone ? "Done" : "Change"}
                    </button>
                  )}
                </div>
                {editingZone && (
                  <Field label="Time zone" hint="Every time on this invite is in this zone, for you and for them." error={errors.timezone?.message}>
                    <Controller
                      control={control}
                      name="timezone"
                      render={({ field }) => (
                        <TimeZoneSelect value={field.value} onChange={field.onChange} disabled={answered} invalid={!!errors.timezone} />
                      )}
                    />
                  </Field>
                )}
              </div>
            </Section>
          </div>

          {footer && <div className="border-t border-ink/10 px-5 py-6">{footer}</div>}
        </form>
      </div>

      {/* Phones: preview and the main action stay in reach */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Button variant="secondary" className="flex-1" onClick={() => setPreviewOpen(true)}>
          Preview
        </Button>
        <div className="flex-[2] [&>button]:w-full [&>button]:py-2.5 [&>button]:text-[14px]">{primary}</div>
      </div>

      {previewOpen && <PreviewSheet values={preview.values} note={exampleTag} onClose={() => setPreviewOpen(false)} />}
      {isClient && sharing && share && createPortal(<ShareDrawer onClose={() => setSharing(false)}>{share}</ShareDrawer>, document.body)}
    </div>
  );
}

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/** Says which parts of the preview are the Theme's example rather than the Creator's own. */
function ExampleTag({ filled }: { filled: string[] }) {
  return (
    <p className="max-w-[440px] text-center text-[12.5px] leading-snug text-muted">
      {`Example ${listFormat.format(filled)} shown until you add your own. It's never sent.`}
    </p>
  );
}

/** Share opens as a drawer over the studio, so the settings stay put. */
function ShareDrawer({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="studio !min-h-0 fixed inset-0 z-50 flex justify-end bg-ink/35" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Share" className="flex h-full w-full max-w-[440px] flex-col bg-white shadow-[-12px_0_40px_-16px_rgba(35,27,23,0.35)]">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink/10 px-5">
          <h2 className="text-[15px] font-semibold text-ink">Share</h2>
          <button type="button" onClick={onClose} className={buttonClass("ghost", "sm")}>
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
