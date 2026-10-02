import "server-only";
import { inviteFormSchema, type InviteFormValues } from "../schemas";
import { DEFAULT_SONG_LENGTH } from "../utils/song";

// Reading the studio's form as the browser sent it. What it saves as is
// formToSaved in utils/invite-content.

/**
 * Validates what the browser sent. A studio tab from before Songs existed (left
 * open across a deploy) sends none: it saves without one, and one from before
 * the part could be chosen plays from the start. (The type says they're there;
 * the browser that sent it may not know that.)
 */
export function readInviteForm(input: InviteFormValues): { ok: true; values: InviteFormValues } | { ok: false; error: string } {
  const sent: Partial<InviteFormValues> | null = input && typeof input === "object" ? input : null;
  const parsed = inviteFormSchema.safeParse(
    sent ? { ...sent, songUrl: sent.songUrl ?? "", songStart: sent.songStart ?? 0, songLength: sent.songLength ?? DEFAULT_SONG_LENGTH } : input,
  );
  return parsed.success ? { ok: true, values: parsed.data } : { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
}
