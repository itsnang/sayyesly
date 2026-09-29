"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useFormState } from "react-hook-form";
import { Wordmark } from "@/components/shared/studio";
import { Button, buttonClass } from "@/components/shared/ui";
import { formatUsd } from "@/lib/format";
import type { InviteFormValues } from "../../../schemas";
import type { ThemeChoice } from "../../../server/theme-access";
import { useStudio } from "../../../stores/studio-store";

/** The studio's only bar: back to the list, the invite's name, save status, Share and the main action. */
export function StudioHeader({ title, canShare, status, action }: { title: string; canShare: boolean; status: ReactNode; action: ReactNode }) {
  const setSharing = useStudio((s) => s.setSharing);

  return (
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
        {canShare && (
          <button type="button" onClick={() => setSharing(true)} className={buttonClass("secondary", "sm")}>
            Share
          </button>
        )}
        <div className="max-lg:hidden">{action}</div>
      </div>
    </header>
  );
}

/** How the last save went: its error, "Saved", or unsaved changes on an existing invite. */
export function SaveStatus({ serverError, saved, isNew }: { serverError: string | null; saved: boolean; isNew: boolean }) {
  const { isDirty } = useFormState<InviteFormValues>();
  if (serverError) {
    return (
      <span role="alert" className="truncate text-[13px] font-medium text-red-700">
        {serverError}
      </span>
    );
  }
  if (saved && !isDirty) return <span className="text-[13px] text-emerald-800">Saved</span>;
  if (!isNew && isDirty) return <span className="text-[13px] text-muted">Unsaved changes</span>;
  return null;
}

/**
 * Create, Save, or Unlock when the selected Theme still has to be bought.
 * Unlocking buys the Theme, not the invite, so it opens checkout without checking the form's fields.
 */
export function PrimaryAction({ isNew, lockedTheme, onUnlock }: { isNew: boolean; lockedTheme: ThemeChoice | null; onUnlock: (theme: ThemeChoice) => void }) {
  const { isSubmitting, isDirty } = useFormState<InviteFormValues>();
  if (lockedTheme) {
    return (
      <Button type="button" size="sm" onClick={() => onUnlock(lockedTheme)}>
        Unlock {formatUsd(lockedTheme.priceCents)}
      </Button>
    );
  }
  if (isNew) {
    return (
      <Button type="submit" form="invite-form" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create invite"}
      </Button>
    );
  }
  return (
    <Button type="submit" form="invite-form" size="sm" disabled={isSubmitting || !isDirty}>
      {isSubmitting ? "Saving…" : "Save"}
    </Button>
  );
}
