import { buttonClass, inputClass } from "@/components/shared/ui";
import { CopyButton } from "./copy-button";
import { RefreshOnFocus } from "./refresh-on-focus";

/**
 * The Share drawer's content: the invite link, ready to send, and one tap to
 * tell a group chat. `justCreated` adds the "it's ready" line after creating.
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
    <div className="grid gap-8">
      <RefreshOnFocus />

      <section aria-labelledby="share-link">
        {justCreated && <p className="mb-4 text-[15px] font-medium text-ink">Your invite is ready.</p>}
        <h3 id="share-link" className="text-[13.5px] font-medium text-ink">
          Link
        </h3>
        <p className="mt-0.5 text-[13px] text-muted">Send it to {who}. You&apos;ll hear the answer on Telegram.</p>
        <input readOnly value={shareUrl} aria-label="Invite link" className={`${inputClass} mt-3 text-muted`} />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <CopyButton text={shareUrl} variant="primary" size="md" />
          <a href={telegramShare} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
            Send in Telegram
          </a>
        </div>
        <p className="mt-2 text-[12.5px] text-muted">If you open it while logged in, you see a preview. Nothing you tap there is saved.</p>
      </section>

      <section aria-labelledby="share-groups" className="border-t border-ink/10 pt-6">
        <h3 id="share-groups" className="text-[13.5px] font-medium text-ink">
          Group chats <span className="font-normal text-faint">optional</span>
        </h3>
        <p className="mt-0.5 text-[13px] text-muted">Linked groups hear the answer the moment it comes in.</p>

        {linkedGroups.length > 0 && (
          <ul aria-label="Linked groups" className="mt-3 divide-y divide-ink/10 rounded-[7px] border border-ink/10">
            {linkedGroups.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 px-3 py-2 text-[14px] text-ink">
                <span className="truncate">{g.title ?? "A group chat"}</span>
                <span className="shrink-0 text-[12.5px] text-emerald-800">Linked</span>
              </li>
            ))}
          </ul>
        )}

        {addToGroup && (
          <a href={addToGroup} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "md", "mt-3 w-full")}>
            {linkedGroups.length > 0 ? "Add another group" : "Add the bot to a group"}
          </a>
        )}

        <details className="mt-3">
          <summary className="cursor-pointer list-none text-[13px] text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
            {addToGroup ? "Didn't work? Link it by hand" : "How to link a group"}
          </summary>
          <div className="mt-2 text-[13.5px] text-muted">
            <ol className="list-decimal space-y-1 pl-5">
              <li>Add {botUsername ? <span className="text-ink">@{botUsername}</span> : "the bot"} to the group.</li>
              <li>Send this message in the group:</li>
            </ol>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded-[7px] border border-ink/10 bg-surface px-3 py-2 font-sans text-[14px] text-ink">{command}</code>
              <CopyButton text={command} label="Copy" />
            </div>
            <p className="mt-2 text-[12.5px] leading-snug">
              The button above can&apos;t link a group you can&apos;t add members to, or one the bot is already in. Anyone with this code can
              link a group, so keep it between friends.
            </p>
          </div>
        </details>
      </section>
    </div>
  );
}
