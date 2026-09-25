import Image from "next/image";
import Link from "next/link";
import { Envelope, Sparkle } from "@/components/shared/doodles";
import { InkButton } from "@/components/shared/studio";
import { Stamp } from "@/components/shared/ui";
import type { InviteStatus, InviteSummary } from "../../server/dashboard-data";
import { getTheme } from "../../themes";
import { inviteTitle } from "../../utils";
import { CopyButton } from "./copy-button";
import { DuplicateInviteButton } from "./duplicate-invite-button";

const STATUS: Record<InviteStatus, { label: string; tone: "rose" | "green" | "amber" | "grey" }> = {
  yes: { label: "Said yes", tone: "green" },
  maybe_later: { label: "Maybe later", tone: "amber" },
  expired: { label: "Expired", tone: "grey" },
  waiting: { label: "Waiting", tone: "rose" },
};

function agreedLabel(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function createdLabel(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
}

export function EmptyInvites() {
  return (
    <div className="relative mx-auto max-w-md rounded-[8px] border border-dashed border-ink/25 px-6 py-14 text-center">
      <Envelope aria-hidden className="mx-auto w-16 -rotate-6 text-ink" />
      <h2 className="mt-5 text-[19px] font-semibold text-ink">No invites yet</h2>
      <p className="mx-auto mt-2 max-w-xs text-[15px] text-muted">
        Write one in a couple of minutes, send the link, and the answer comes to your Telegram.
      </p>
      <div className="mt-7 flex justify-center">
        <InkButton href="/dashboard/invites/new">Write your first invite</InkButton>
      </div>
      <Sparkle aria-hidden className="absolute top-6 right-8 size-6 text-ink" />
    </div>
  );
}

export function InviteList({ invites, siteUrl }: { invites: InviteSummary[]; siteUrl: string }) {
  if (invites.length === 0) return <EmptyInvites />;

  return (
    <ul className="overflow-hidden rounded-[8px] border border-ink/12 bg-card">
      {invites.map((invite) => {
        const status = STATUS[invite.status];
        const theme = getTheme(invite.themeId);
        const shareUrl = new URL(`/invite/${invite.slug}`, siteUrl).toString();
        return (
          <li key={invite.id} className="group relative flex items-center gap-3.5 border-b border-ink/15 px-3.5 py-3.5 last:border-b-0 hover:bg-surface/60 sm:gap-5 sm:px-5">
            <span className="relative block h-[68px] w-[44px] shrink-0 overflow-hidden rounded-[4px] border border-ink/12 bg-surface">
              {theme && <Image src={theme.thumbnail} alt="" fill sizes="44px" className="object-cover object-[50%_35%]" />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <Link href={`/dashboard/invites/${invite.id}`} className="min-w-0 after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-rose">
                  <span className="block truncate text-[18px] font-semibold leading-tight text-ink">{inviteTitle(invite.recipientName, invite.question)}</span>
                </Link>
                <Stamp tone={status.tone}>{status.label}</Stamp>
              </div>
              <p className="mt-1 truncate text-[14px] text-muted">
                {invite.status === "yes" && invite.agreedAt ? (
                  <span className="text-ink">{agreedLabel(invite.agreedAt, invite.timezone)}</span>
                ) : invite.recipientName.trim() ? (
                  invite.question
                ) : (
                  // The title is already the question; say when it was made instead.
                  `Made ${createdLabel(invite.createdAt)}`
                )}
              </p>
            </div>

            {/* Above the row's link overlay so it stays clickable */}
            <div className="relative z-10 flex shrink-0 items-center gap-1">
              <CopyButton text={shareUrl} label="Copy link" />
              <DuplicateInviteButton inviteId={invite.id} compact />
              <span aria-hidden className="hidden px-1 text-[18px] text-faint transition group-hover:translate-x-0.5 group-hover:text-ink sm:inline">
                →
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
