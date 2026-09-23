"use client";

import { useState } from "react";
import { Button, Card } from "@/components/shared/ui";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? "copied ✓" : label}
    </Button>
  );
}

/** The share link and the /link instructions for notifying a group chat. */
export function SharePanel({ shareUrl, linkCode, botUsername }: { shareUrl: string; linkCode: string; botUsername: string | null }) {
  const command = `/link ${linkCode}`;
  return (
    <Card className="grid gap-5">
      <div>
        <h2 className="text-lg text-[var(--ink)]">send this link 💌</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-[var(--paper-2)] px-3 py-2 text-sm text-[var(--ink)]">{shareUrl}</code>
          <CopyButton text={shareUrl} label="copy link" />
        </div>
        <p className="mt-2 text-xs text-[var(--ink-soft)]">
          Opening it yourself while logged in shows a preview. Your taps there aren&apos;t saved.
        </p>
      </div>

      <div>
        <h3 className="text-[15px] text-[var(--ink)]">tell a group chat too (optional)</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--ink-soft)]">
          <li>
            Add {botUsername ? <b>@{botUsername}</b> : "the bot"} to your Telegram group.
          </li>
          <li>
            Send this in the group:{" "}
            <code className="rounded bg-[var(--paper-2)] px-1.5 py-0.5 text-[var(--ink)]">{command}</code>
          </li>
          <li>The group hears the answer the moment it comes in.</li>
        </ol>
        <div className="mt-2">
          <CopyButton text={command} label="copy command" />
        </div>
        <p className="mt-2 text-xs text-[var(--ink-soft)]">Keep this code between friends. Anyone with it can link a group.</p>
      </div>
    </Card>
  );
}
