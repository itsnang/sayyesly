"use client";

import { useState, type ComponentProps } from "react";
import { BuyThemeDialog } from "@/features/billing/components/checkout";
import { InviteEditor } from "@/features/invites/components/dashboard/editor/invite-editor";
import type { ThemeChoice } from "@/features/invites/server/theme-access";

/**
 * The invite editor with Paid themes buyable in place: the form stays
 * mounted (nothing typed is lost) and switches to the Theme once it's paid.
 */
export function InviteStudio(props: Omit<ComponentProps<typeof InviteEditor>, "onUnlockTheme">) {
  const [buying, setBuying] = useState<{ theme: ThemeChoice; select: () => void } | null>(null);
  return (
    <>
      <InviteEditor {...props} onUnlockTheme={(theme, select) => setBuying({ theme, select })} />
      {buying && (
        <BuyThemeDialog key={buying.theme.id} theme={buying.theme} onPaid={buying.select} onClose={() => setBuying(null)} />
      )}
    </>
  );
}
