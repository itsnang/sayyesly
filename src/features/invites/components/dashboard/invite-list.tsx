import Image from "next/image";
import Link from "next/link";
import { Cat, Envelope, Heart, Sparkle } from "@/components/shared/doodles";
import { InkButton } from "@/components/shared/studio";
import type { InviteStatus, InviteSummary } from "../../server/dashboard-data";
import { getTheme } from "../../themes";
import { CopyButton } from "./copy-button";

const STATUS: Record<InviteStatus, { label: string; dot: string }> = {
  yes: { label: "Said yes", dot: "bg-emerald-500" },
  maybe_later: { label: "Maybe another time", dot: "bg-amber-400" },
  expired: { label: "Expired", dot: "bg-faint" },
  waiting: { label: "Waiting for an answer", dot: "bg-rose" },
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

export function EmptyInvites() {
  return (
    <div className="relative mx-auto max-w-md rounded-[20px] border-[1.5px] border-dashed border-ink/30 px-6 py-14 text-center">
      <Envelope aria-hidden className="mx-auto w-16 -rotate-6 text-ink" />
      <h2 className="mt-5 font-display text-[26px] text-ink">No invites yet</h2>
      <p className="mx-auto mt-2 max-w-xs text-[15px] text-muted">
        Write one, send the link, and the answer comes to your Telegram.
      </p>
      <div className="mt-7 flex justify-center">
        <InkButton href="/dashboard/invites/new">
          Write your first invite <Heart className="size-3.5 text-rose" strokeWidth={2.4} />
        </InkButton>
      </div>
      <Sparkle aria-hidden className="absolute top-6 right-8 size-6 text-ink" />
      <Cat aria-hidden className="absolute -bottom-1 -left-20 w-20 text-ink max-md:hidden" />
    </div>
  );
}

export function InviteList({ invites, siteUrl }: { invites: InviteSummary[]; siteUrl: string }) {
  if (invites.length === 0) return <EmptyInvites />;

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {invites.map((invite) => {
        const status = STATUS[invite.status];
        const theme = getTheme(invite.themeId);
        const shareUrl = new URL(`/i/${invite.slug}`, siteUrl).toString();
        return (
          <li
            key={invite.id}
            className="group relative flex gap-4 rounded-[20px] border border-ink/12 bg-card p-4 transition hover:border-ink/40 hover:shadow-[4px_5px_0_var(--color-rose-soft)]"
          >
            <span className="relative block h-[92px] w-[56px] shrink-0 overflow-hidden rounded-[12px] border border-ink/15 bg-surface">
              {theme && <Image src={theme.thumbnail} alt="" fill sizes="56px" className="object-cover object-[50%_35%]" />}
            </span>

            <div className="min-w-0 flex-1">
              <Link href={`/dashboard/invites/${invite.id}`} className="after:absolute after:inset-0 after:rounded-[20px]">
                <span className="block truncate font-display text-[22px] leading-tight text-ink">For {invite.recipientName}</span>
              </Link>
              <p className="mt-0.5 truncate text-[14px] text-muted">{invite.question}</p>
              <p className="mt-2.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink">
                <span aria-hidden className={`size-2 rounded-full ${status.dot}`} />
                {status.label}
                {invite.status === "yes" && invite.agreedAt && (
                  <span className="text-muted">· {agreedLabel(invite.agreedAt, invite.timezone)}</span>
                )}
              </p>
            </div>

            {/* Above the card's link overlay so it stays clickable */}
            <div className="relative z-10 self-start">
              <CopyButton text={shareUrl} label="Copy link" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
