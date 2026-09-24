"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonClass, cx } from "@/components/shared/ui";
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
 * Makes a new Invite from this one: same question, Plan and Theme, a fresh
 * link, no old Time slots and no Answer. Goes straight to the new Invite's
 * Share step, same as creating one from scratch.
 */
export function DuplicateInviteButton({ inviteId, compact }: { inviteId: string; compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.MouseEvent) {
    e.preventDefault(); // sits inside a row that's otherwise a link to the invite
    e.stopPropagation();
    setBusy(true);
    setError(null);
    const result = await duplicateInvite(inviteId);
    if (result.error || !result.id) {
      const message = result.error ?? "Couldn't duplicate. Please try again.";
      // The compact (list row) button has no room for inline text, so it falls
      // back the same way CopyButton does when its own action can't complete.
      if (compact) window.alert(message);
      else setError(message);
      setBusy(false);
      return;
    }
    router.push(`/dashboard/invites/${result.id}?created=1`);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={run}
        disabled={busy}
        aria-label="Duplicate this invite"
        title="Duplicate"
        className={cx(buttonClass("secondary", "sm", "!px-2"), busy && "animate-pulse")}
      >
        <DuplicateIcon />
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" disabled={busy} onClick={run}>
        <DuplicateIcon />
        {busy ? "Duplicating…" : "Duplicate as a new invite"}
      </Button>
      {error && <span className="text-sm text-red-700">{error}</span>}
    </div>
  );
}
