import Link from "next/link";
import { Badge, ButtonLink, Card } from "@/components/shared/ui";
import type { InviteStatus, InviteSummary } from "../../server/dashboard-data";

const STATUS: Record<InviteStatus, { label: string; tone: "pink" | "green" | "grey" | "amber" }> = {
  yes: { label: "said yes 🎉", tone: "green" },
  maybe_later: { label: "maybe later", tone: "amber" },
  expired: { label: "expired", tone: "grey" },
  waiting: { label: "waiting for an answer", tone: "pink" },
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

export function InviteList({ invites }: { invites: InviteSummary[] }) {
  if (invites.length === 0) {
    return (
      <Card className="text-center">
        <p className="font-[family-name:var(--hand)] text-3xl text-[var(--ink)]">no invites yet</p>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">Make one, send the link, and hear the answer on Telegram.</p>
        <ButtonLink href="/dashboard/invites/new" className="mt-5">
          make an invite ✦
        </ButtonLink>
      </Card>
    );
  }

  return (
    <ul className="grid gap-3">
      {invites.map((invite) => {
        const status = STATUS[invite.status];
        return (
          <li key={invite.id}>
            <Link
              href={`/dashboard/invites/${invite.id}`}
              className="block rounded-2xl border-2 border-[var(--line)]/40 bg-[var(--paper)] p-4 transition hover:border-[var(--accent)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[17px] text-[var(--ink)]">for {invite.recipientName}</span>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <p className="mt-1 truncate text-sm text-[var(--ink-soft)]">{invite.question}</p>
              {invite.status === "yes" && invite.agreedAt && (
                <p className="mt-1 text-sm text-emerald-800">📅 {agreedLabel(invite.agreedAt, invite.timezone)}</p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
