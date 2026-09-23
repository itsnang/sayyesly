import { Heart, Sparkle } from "@/components/shared/doodles";
import { buttonClass, cx, Eyebrow } from "@/components/shared/ui";
import { CopyButton } from "./copy-button";

/**
 * The invite link, ready to send, plus how to tell a group chat.
 * `justCreated` turns it into the "your invite is ready" moment.
 */
export function SharePanel({
  shareUrl,
  linkCode,
  botUsername,
  recipientName,
  justCreated,
}: {
  shareUrl: string;
  linkCode: string;
  botUsername: string | null;
  recipientName: string;
  justCreated: boolean;
}) {
  const command = `/link ${linkCode}`;
  const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`;

  return (
    <section
      aria-label="Send your invite"
      className={cx(
        "relative rounded-[8px] border-[1.5px] border-ink bg-card p-5 sm:p-7",
        justCreated && "shadow-[6px_6px_0_var(--color-rose)]",
      )}
    >
      {justCreated && (
        <>
          <Sparkle aria-hidden className="absolute -top-4 -right-3 size-8 text-ink" />
          <Heart aria-hidden className="absolute -top-3 right-8 size-5 text-rose" />
        </>
      )}
      <Eyebrow>{justCreated ? "Done · step 2 of 2" : "Share"}</Eyebrow>
      <h2 className="mt-1 font-display text-[26px] leading-tight text-ink">{justCreated ? "Now send it." : "Send the link"}</h2>
      <p className="mt-1 text-[15px] text-muted">
        {justCreated
          ? `Send this link to ${recipientName}. You'll hear the answer on Telegram.`
          : `Send this to ${recipientName}, wherever you talk.`}
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <code className="min-w-0 flex-1 truncate rounded-[6px] border-[1.5px] border-dashed border-ink/40 bg-surface px-3.5 py-2.5 font-mono text-[14px] text-ink">
          {shareUrl}
        </code>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <CopyButton text={shareUrl} variant="primary" size="md" />
          <a href={telegramShare} target="_blank" rel="noopener noreferrer" className={buttonClass("telegram")}>
            Send in Telegram
          </a>
        </div>
      </div>
      <p className="mt-2.5 text-[12.5px] text-muted">
        Opening it yourself while logged in shows a preview. Nothing you tap there is saved.
      </p>

      <details className="group mt-6 border-t-[1.5px] border-dashed border-ink/20 pt-4">
        <summary className="cursor-pointer list-none text-[14px] font-medium text-ink [&::-webkit-details-marker]:hidden">
          <span className="mr-1 inline-block font-mono text-muted transition group-open:rotate-45">+</span>
          Tell a group chat too <span className="font-normal text-muted">(optional)</span>
        </summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[14px] text-muted">
          <li>Add {botUsername ? <b className="font-medium text-ink">@{botUsername}</b> : "the bot"} to the group.</li>
          <li>
            Send <code className="rounded-[4px] border border-ink/20 bg-surface px-1.5 py-0.5 font-mono text-ink">{command}</code> in the group.
          </li>
          <li>The group hears the answer the moment it comes in.</li>
        </ol>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CopyButton text={command} label="Copy command" />
          <span className="text-[12.5px] text-muted">Keep the code among friends; anyone with it can link a group.</span>
        </div>
      </details>
    </section>
  );
}
