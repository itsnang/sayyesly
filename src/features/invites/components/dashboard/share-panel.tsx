import { Heart, Sparkle } from "@/components/shared/doodles";
import { buttonClass, cx, Eyebrow } from "@/components/shared/ui";
import { CopyButton } from "./copy-button";
import { RefreshOnFocus } from "./refresh-on-focus";

/**
 * The invite link, ready to send, plus one tap to tell a group chat.
 * `justCreated` turns it into the "your invite is ready" moment.
 */
export function SharePanel({
  shareUrl,
  linkCode,
  botUsername,
  recipientName,
  linkedGroups,
  justCreated,
}: {
  shareUrl: string;
  linkCode: string;
  botUsername: string | null;
  recipientName: string;
  linkedGroups: { id: string; title: string | null }[];
  justCreated: boolean;
}) {
  const who = recipientName.trim() || "them";
  const command = `/link ${linkCode}`;
  const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`;
  // Telegram's group picker; the bot receives `/start <Link code>` in the chosen group and links it.
  // No `admin` parameter: some Telegram apps drop the code when it's there.
  const addToGroup = botUsername ? `https://t.me/${botUsername}?startgroup=${encodeURIComponent(linkCode)}` : null;

  return (
    <section
      aria-label="Send your invite"
      className={cx("relative rounded-[8px] border-[1.5px] border-ink bg-card p-5 sm:p-7", justCreated && "shadow-[6px_6px_0_var(--color-rose)]")}
    >
      <RefreshOnFocus />
      {justCreated && (
        <>
          <Sparkle aria-hidden className="absolute -top-4 -right-3 size-8 text-ink" />
          <Heart aria-hidden className="absolute -top-3 right-8 size-5 text-rose" />
        </>
      )}
      <Eyebrow>{justCreated ? "Done · step 2 of 2" : "Share"}</Eyebrow>
      <h2 className="mt-1 font-display text-[26px] leading-tight text-ink">{justCreated ? "Now send it." : "Send the link"}</h2>
      <p className="mt-1 text-[15px] text-muted">
        {justCreated ? `Send this link to ${who}. You'll hear the answer on Telegram.` : `Send this to ${who}, wherever you talk.`}
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <code className="min-w-0 flex-1 truncate font-sans rounded-[6px] border-[1.5px] border-dashed border-ink/40 bg-surface px-3.5 py-2.5 text-[14px] text-ink">
          {shareUrl}
        </code>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <CopyButton text={shareUrl} variant="primary" size="md" />
          <a href={telegramShare} target="_blank" rel="noopener noreferrer" className={buttonClass("telegram")}>
            Send in Telegram
          </a>
        </div>
      </div>
      <p className="mt-2.5 text-[12.5px] text-muted">Opening it yourself while logged in shows a preview. Nothing you tap there is saved.</p>

      {/* Group chat */}
      <div className="mt-6 border-t-[1.5px] border-dashed border-ink/20 pt-5">
        <h3 className="text-[15px] font-semibold text-ink">Tell a group chat too</h3>
        <p className="mt-0.5 text-[14px] text-muted">Your friends hear the answer the moment it comes in. Optional.</p>

        {linkedGroups.length > 0 && (
          <ul aria-label="Linked groups" className="mt-3 flex flex-wrap gap-1.5">
            {linkedGroups.map((g) => (
              <li key={g.id} className="rounded-[5px] border-[1.5px] border-emerald-800/60 bg-emerald-50 px-2.5 py-1 text-[13.5px] text-emerald-900">
                ✓ {g.title ?? "A group chat"}
              </li>
            ))}
          </ul>
        )}

        {addToGroup && (
          <a href={addToGroup} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "md", "mt-3")}>
            {linkedGroups.length > 0 ? "Add another group" : "Add the bot to a group chat"}
          </a>
        )}

        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-[13.5px] text-muted underline decoration-ink/25 underline-offset-4 hover:text-ink [&::-webkit-details-marker]:hidden">
            {addToGroup ? "Didn't work?" : "How to link a group"}
          </summary>
          <div className="mt-2 rounded-[6px] bg-surface/70 p-3.5 text-[14px] text-muted">
            <ol className="list-decimal space-y-1 pl-5">
              <li>Add {botUsername ? <b className="font-medium text-ink">@{botUsername}</b> : "the bot"} to the group.</li>
              <li>
                Send <code className="rounded-[4px] border border-ink/20 bg-card px-1.5 py-0.5 font-sans text-ink">{command}</code> there.
              </li>
            </ol>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <CopyButton text={command} label="Copy command" />
            </div>
            <p className="mt-3 text-[12.5px] leading-snug">
              The group button doesn&apos;t work when you can&apos;t add members to that group, or when the bot is already in it. Keep the code
              among friends: anyone with it can link a group.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
