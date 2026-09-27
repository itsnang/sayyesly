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
import { useDeleteInvite } from "../../hooks/use-invite-mutations";

/** Deletes the Invite for good, after asking once in a dialog. A failure keeps the dialog open with the reason. */
export function DeleteInviteButton({ inviteId }: { inviteId: string }) {
  const [open, setOpen] = useState(false);
  const mutation = useDeleteInvite();
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
        <Button type="button" variant="danger">
          Delete invite
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this invite?</AlertDialogTitle>
          <AlertDialogDescription>
            It&apos;s deleted for good, with its answer and linked groups. The link stops working for anyone who has it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-[13.5px] font-medium text-red-700">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Keep it</AlertDialogCancel>
          <Button type="button" variant="danger" disabled={busy} onClick={() => mutation.mutate(inviteId)}>
            {busy ? "Deleting…" : "Delete invite"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
