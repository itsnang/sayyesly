"use client";

import { useState } from "react";
import { Button, Note } from "@/components/shared/ui";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { track } from "@/lib/analytics/track";
import { AnswerKind } from "@/lib/enums";
import { errorMessage } from "@/lib/query/action";
import { useReopenInvite } from "../../hooks/use-invite-mutations";

type Props = {
  inviteId: string;
  recipientName: string;
  themeId: string;
  /** The Answer being cleared */
  answerKind: AnswerKind;
  /** ISO instant they agreed to, for a Yes */
  answerAt: string | null;
  /** The Invite's time zone, to show that time as they saw it */
  timezone: string;
  /** Every time has passed and they can't pick one: once reopened it can't be answered until a time is added */
  expired: boolean;
};

/** Their Answer in a few words, e.g. "Said yes · Wed, Sep 30, 7:00 PM" or "Maybe later". */
function describeAnswer(kind: AnswerKind, at: string | null, timeZone: string): string {
  if (kind === AnswerKind.MaybeLater) return "Maybe later";
  if (!at) return "Said yes";
  const when = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(
    new Date(at),
  );
  return `Said yes · ${when}`;
}

/**
 * Reopens an answered Invite, after a confirm step that shows exactly which
 * Answer will be cleared. Once confirmed, the Recipient starts again from the
 * Invite's first screen on the same link. A failure keeps the dialog open with the reason.
 */
export function ReopenInviteButton({ inviteId, recipientName, themeId, answerKind, answerAt, timezone, expired }: Props) {
  const [open, setOpen] = useState(false);
  const mutation = useReopenInvite();
  const busy = mutation.isPending || mutation.isSuccess;
  const error = errorMessage(mutation.error);
  const name = recipientName.trim();

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        setOpen(next);
        if (next) mutation.reset();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button type="button" variant="secondary">
          Let them answer again
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear {name ? `${name}'s` : "their"} answer?</AlertDialogTitle>
          <AlertDialogDescription>This answer, and any note with it, will be deleted for good:</AlertDialogDescription>
        </AlertDialogHeader>
        <p className="rounded-[8px] border border-ink/10 bg-surface px-3 py-2.5 text-[14px] font-medium text-ink">
          {describeAnswer(answerKind, answerAt, timezone)}
        </p>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Next time they open the same link, the invite starts from the beginning, as if they&apos;d never answered. You&apos;ll get a new Telegram
          message when they answer again.
        </p>
        {expired && <Note tone="warn">All your times have passed. After this, add a new time or let them pick one, or they can&apos;t answer.</Note>}
        {error && (
          <p role="alert" className="text-[13.5px] font-medium text-red-700">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="danger"
            disabled={busy}
            onClick={() => mutation.mutate(inviteId, { onSuccess: () => track("invite_reopened", { theme: themeId, kind: answerKind }) })}
          >
            {busy ? "Clearing…" : "Clear answer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
