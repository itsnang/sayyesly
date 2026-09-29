import { track } from "@/lib/analytics/track";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ActionError, errorMessage, runAction } from "@/lib/query/action";
import { buyTheme, getPurchaseStatus } from "../actions";
import type { CheckoutResult } from "../types";
import { isPurchaseSettled, PurchasePhase, waitingPhase } from "../utils/purchase-phase";

export type Ticket = { purchaseId: string; qrImageUrl: string; checkoutUrl: string | null; expiresAt: string; amountCents: number };

const POLL_MS = 2500;
const STATUS_KEY = "purchase-status";

function toTicket(result: CheckoutResult): Ticket | null {
  const { purchaseId, qrImageUrl, expiresAt, amountCents } = result;
  if (!purchaseId || !qrImageUrl || !expiresAt || amountCents === undefined) return null;
  return { purchaseId, qrImageUrl, expiresAt, amountCents, checkoutUrl: result.checkoutUrl ?? null };
}

function useCountdown(until: string | null) {
  const left = () => (until ? Math.max(0, new Date(until).getTime() - Date.now()) : 0);
  const [ms, setMs] = useState(left);
  useEffect(() => {
    if (!until) return;
    const tick = () => setMs(Math.max(0, new Date(until).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);
  const s = Math.ceil(ms / 1000);
  return { expired: !!until && ms === 0, label: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` };
}

/**
 * Buying one Paid theme, start to finish. Creates (or resumes) the CutLuy
 * payment once, then polls our own database for its status (only the verified
 * webhook changes it) until it's paid, failed or expired. Polling pauses in a
 * hidden tab, never overlaps, and stops when the caller unmounts. `onPaid`
 * runs once, then the page's server data is refreshed so the Theme shows as owned.
 */
export function useThemePurchase(themeId: string, onPaid?: () => void) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const start = useMutation({ mutationFn: () => runAction(() => buyTheme(themeId)) });
  const ticket = start.data && !start.data.owned ? toTicket(start.data) : null;
  const countdown = useCountdown(ticket?.expiresAt ?? null);

  const status = useQuery({
    queryKey: [STATUS_KEY, ticket?.purchaseId],
    queryFn: () => runAction(() => getPurchaseStatus(ticket!.purchaseId)),
    enabled: !!ticket && !countdown.expired,
    refetchInterval: (query) => (isPurchaseSettled(query.state.data?.status) ? false : POLL_MS),
  });

  // Ask for the payment once per checkout. Without the guard, React's dev
  // double-run of effects sends two requests that queue on the server's lock.
  const { mutate } = start;
  const requested = useRef(false);
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    mutate();
  }, [mutate]);

  // A dropped connection while polling just means "try again on the next tick";
  // only an answer from our server (e.g. "Please log in again") stops the checkout.
  const statusRefused = status.error instanceof ActionError && !status.error.network;

  let phase: PurchasePhase;
  if (start.isError) phase = PurchasePhase.Error;
  else if (!start.data) phase = PurchasePhase.Starting;
  else if (start.data.owned) phase = PurchasePhase.Paid;
  else if (!ticket || statusRefused) phase = PurchasePhase.Error;
  else phase = waitingPhase(status.data?.status, countdown.expired);

  const alreadyOwned = start.data?.owned === true;
  const paidOnce = useRef(false);
  useEffect(() => {
    if (phase !== PurchasePhase.Paid || paidOnce.current) return;
    paidOnce.current = true;
    // Already owned means nothing was bought this time.
    if (!alreadyOwned) track("theme_paid", { theme: themeId });
    onPaid?.();
    router.refresh();
  }, [phase, onPaid, router, alreadyOwned, themeId]);

  return {
    phase,
    ticket,
    countdown: countdown.label,
    error: phase === PurchasePhase.Error ? (errorMessage(start.error) ?? errorMessage(status.error) ?? "Couldn't start the payment. Please try again.") : null,
    /** Start a fresh payment after one failed, lapsed or errored */
    retry: () => {
      queryClient.removeQueries({ queryKey: [STATUS_KEY] });
      start.reset();
      mutate();
    },
  };
}
