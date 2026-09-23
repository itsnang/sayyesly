import { Heart, Sparkle } from "@/components/shared/doodles";
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
      className={`relative rounded-[20px] border-[1.5px] border-ink bg-card p-5 sm:p-7 ${justCreated ? "shadow-[6px_7px_0_var(--color-rose-soft)]" : ""}`}
    >
      {justCreated && (
        <>
          <Sparkle aria-hidden className="absolute -top-4 -right-3 size-8 text-ink" />
          <Heart aria-hidden className="absolute -top-3 right-8 size-5 text-rose" />
        </>
      )}
      <h2 className="font-display text-[26px] leading-tight text-ink">
        {justCreated ? "Your invite is ready." : "Send the link"}
      </h2>
      <p className="mt-1 text-[15px] text-muted">
        {justCreated ? `Send this link to ${recipientName}. You'll hear the answer on Telegram.` : `Send this to ${recipientName}, wherever you talk.`}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-xl border border-ink/12 bg-surface px-3.5 py-2.5 font-mono text-[14px] text-ink">{shareUrl}</code>
        <CopyButton
          text={shareUrl}
          className="rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-canvas transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
        />
        <a
          href={telegramShare}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#2aabee] px-4 py-2.5 text-[14px] font-medium text-white transition hover:brightness-105"
        >
          Send in Telegram
        </a>
      </div>
      <p className="mt-2 text-[12.5px] text-muted">If you open it yourself while logged in, you&apos;ll see a preview. Nothing you tap there is saved.</p>

      <details className="group mt-6 border-t border-dashed border-ink/20 pt-4">
        <summary className="cursor-pointer list-none text-[14px] text-ink [&::-webkit-details-marker]:hidden">
          <span className="font-mono text-[13px] text-muted group-open:hidden">+ </span>
          Tell a group chat too <span className="text-muted">(optional)</span>
        </summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[14px] text-muted">
          <li>Add {botUsername ? <b className="font-medium text-ink">@{botUsername}</b> : "the bot"} to the group.</li>
          <li>
            Send <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-ink">{command}</code> in the group.
          </li>
          <li>The group hears the answer the moment it comes in.</li>
        </ol>
        <div className="mt-3 flex items-center gap-3">
          <CopyButton text={command} label="Copy command" />
          <span className="text-[12.5px] text-muted">Keep the code among friends; anyone with it can link a group.</span>
        </div>
      </details>
    </section>
  );
}
