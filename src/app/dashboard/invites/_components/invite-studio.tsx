"use client";

import type { ComponentProps } from "react";
import { BuyThemeDialog } from "@/features/billing/components/checkout";
import { InviteEditor } from "@/features/invites/components/dashboard/editor/invite-editor";
import { StudioStoreProvider, useStudio } from "@/features/invites/stores/studio-store";

/**
 * The invite editor with Paid themes buyable in place: the form stays
 * mounted (nothing typed is lost) and switches to the Theme once it's paid.
 * The studio's screen state lives in one store per studio (docs/adr/0003).
 */
export function InviteStudio({
  shareOpen,
  ...props
}: ComponentProps<typeof InviteEditor> & {
  /** Open the Share drawer straight away, e.g. right after creating */
  shareOpen?: boolean | undefined;
}) {
  return (
    <StudioStoreProvider sharing={!!shareOpen}>
      <InviteEditor {...props} />
      <StudioCheckout />
    </StudioStoreProvider>
  );
}

/** The checkout for the Paid theme the editor asked to unlock, if any. */
function StudioCheckout() {
  const checkout = useStudio((s) => s.checkout);
  const close = useStudio((s) => s.closeCheckout);
  if (!checkout) return null;
  return <BuyThemeDialog key={checkout.theme.id} theme={checkout.theme} onPaid={checkout.select} onClose={close} />;
}
