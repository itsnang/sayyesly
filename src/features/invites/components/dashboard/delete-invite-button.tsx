"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/shared/ui";
import { deleteInvite } from "../../actions";

export function DeleteInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <Button type="button" variant="danger" onClick={() => setConfirming(true)}>
        Delete invite
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-red-800">Delete it for good? The link stops working.</span>
      <Button
        type="button"
        variant="danger"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const result = await deleteInvite(inviteId);
          if (result.error) {
            setError(result.error);
            setBusy(false);
            return;
          }
          router.push("/dashboard");
        }}
      >
        {busy ? "Deleting…" : "Yes, delete it"}
      </Button>
      <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
        Keep it
      </Button>
      {error && <span className="text-sm text-red-700">{error}</span>}
    </div>
  );
}
