"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { track } from "@/lib/analytics/track";
import { errorMessage } from "@/lib/query/action";
import { useSaveInvite } from "../../../hooks/use-invite-mutations";
import { inviteFormSchema, type InviteFormValues } from "../../../schemas";
import type { ThemeChoice } from "../../../server/theme-choices";
import { useStudio } from "../../../stores/studio-store";
import { ALL_CONTENT, hasError, MAIN_FIELDS, sectionsWithErrors } from "./sections";
import { isThemeLocked } from "./theme-field";

type Options = {
  inviteId: string | null;
  defaults: InviteFormValues;
  answered: boolean;
  themes: ThemeChoice[];
};

/**
 * The invite form and what saving it does: create (then open Share), update,
 * or, when the selected Theme is still locked, open its checkout instead. A
 * problem opens the sections that have one. The fields themselves read the
 * form through React Hook Form's context.
 */
export function useInviteForm({ inviteId, defaults, answered, themes }: Options) {
  const router = useRouter();
  const isNew = inviteId === null;
  const save = useSaveInvite(inviteId);
  const openCheckout = useStudio((s) => s.openCheckout);
  const revealSections = useStudio((s) => s.revealSections);
  // Only about the last save, so it stays with the form.
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<InviteFormValues>({ resolver: zodResolver(inviteFormSchema), defaultValues: defaults, mode: "onTouched" });
  const { setValue, reset } = form;
  const values = useWatch({ control: form.control }) as InviteFormValues;

  // New invites start in the Creator's own time zone.
  useEffect(() => {
    if (!isNew) return;
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone && zone !== defaults.timezone) setValue("timezone", zone);
  }, [isNew, defaults.timezone, setValue]);

  // The selected Theme decides which optional fields are worth asking for.
  const selectedTheme = themes.find((t) => t.id === values.themeId);
  const content = selectedTheme?.content ?? ALL_CONTENT;
  // A Paid theme can be tried on the preview before buying; it has to be unlocked to save.
  const lockedTheme = isThemeLocked(selectedTheme, defaults.themeId) ? selectedTheme! : null;

  /** Buys a locked Theme without leaving the form; once it's paid, the Invite switches to it. */
  const unlock = (theme: ThemeChoice) => openCheckout(theme, () => setValue("themeId", theme.id, { shouldDirty: true }));

  async function onValid(data: InviteFormValues) {
    setServerError(null);
    setSaved(false);
    if (lockedTheme) return unlock(lockedTheme);

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
  function onInvalid(errors: FieldErrors<InviteFormValues>) {
    const broken = sectionsWithErrors(errors);
    if (broken.length) revealSections(broken);
    if (!hasError(errors, MAIN_FIELDS) && broken[0]) {
      requestAnimationFrame(() => document.getElementById(`section-${broken[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
  }

  return {
    form,
    values,
    isNew,
    content,
    /** The selected Theme when it still has to be bought before saving */
    lockedTheme,
    unlock,
    submit: form.handleSubmit(onValid, onInvalid),
    serverError,
    saved,
  };
}
