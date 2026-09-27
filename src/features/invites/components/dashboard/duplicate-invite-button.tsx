"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonClass } from "@/components/shared/ui";
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
import { duplicateInvite } from "../../actions";

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className ?? "size-4"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="8" height="8" rx="1.5" />
      <path d="M10 6V4.5A1.5 1.5 0 0 0 8.5 3h-4A1.5 1.5 0 0 0 3 4.5v4A1.5 1.5 0 0 0 4.5 10H6" />
    </svg>
  );
}

/**
 * Makes a new Invite from this one, after saying what gets copied: same
 * question, Plan and Theme, a fresh link, no old Time slots and no Answer.
 * Goes straight to the new Invite's Share step, same as creating one from
 * scratch. A failure keeps the dialog open with the reason.
 */
export function DuplicateInviteButton({ inviteId, compact }: { inviteId: string; compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    const result = await duplicateInvite(inviteId);
    if (result.error || !result.id) {
      setError(result.error ?? "Couldn't duplicate. Please try again.");
      setBusy(false);
      return;
    }
    router.push(`/dashboard/invites/${result.id}?created=1${result.themeSwapped ? "&themeSwapped=1" : ""}`);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        setOpen(next);
        if (next) setError(null);
      }}
    >
      <AlertDialogTrigger asChild>
        {compact ? (
          <button type="button" aria-label="Duplicate this invite" title="Duplicate" className={buttonClass("secondary", "sm", "!px-2")}>
            <DuplicateIcon />
          </button>
        ) : (
          <Button type="button" variant="secondary">
            <DuplicateIcon />
            Duplicate as a new invite
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate this invite?</AlertDialogTitle>
          <AlertDialogDescription>
            You get a new invite with the same question, plan and theme, and a new link to send. Times and the answer aren&apos;t copied, so
            they pick the time. This one stays as it is.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-[13.5px] font-medium text-red-700">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <Button type="button" disabled={busy} onClick={run}>
            {busy ? "Duplicating…" : "Duplicate"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
