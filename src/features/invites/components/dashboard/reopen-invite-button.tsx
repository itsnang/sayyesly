"use client";

import { useState } from "react";
import { Button } from "@/components/shared/ui";
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
import { errorMessage } from "@/lib/query/action";
import { useReopenInvite } from "../../hooks/use-invite-mutations";

/**
 * Reopens an answered Invite, after asking once in a dialog: the Answer is
 * cleared and the Recipient can answer again on the same link. A failure keeps
 * the dialog open with the reason.
 */
export function ReopenInviteButton({ inviteId, recipientName }: { inviteId: string; recipientName: string }) {
  const [open, setOpen] = useState(false);
  const mutation = useReopenInvite();
  const busy = mutation.isPending || mutation.isSuccess;
  const error = errorMessage(mutation.error);

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
          <AlertDialogTitle>Let {recipientName.trim() || "them"} answer again?</AlertDialogTitle>
          <AlertDialogDescription>
            Their answer is cleared for good, with the time they picked and their note. When they open the same link again, they see the
            question again, and you&apos;ll get a new message on Telegram when they answer. You can change the question, times and theme
            again too.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-[13.5px] font-medium text-red-700">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Keep the answer</AlertDialogCancel>
          <Button type="button" disabled={busy} onClick={() => mutation.mutate(inviteId)}>
            {busy ? "Clearing…" : "Clear the answer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
