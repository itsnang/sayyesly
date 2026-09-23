import { buttonClass, Note, PageHeading } from "@/components/shared/ui";
import { InviteList } from "@/features/invites/components/dashboard/invite-list";
import { listMyInvites } from "@/features/invites/server/dashboard-data";
import { requireUser } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/site";
import { getBotUsername } from "@/lib/telegram";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [invites, botUsername] = await Promise.all([
    listMyInvites(user.id),
    user.canDm ? null : getBotUsername().catch(() => null),
  ]);
  return (
    <>
      <PageHeading
        eyebrow={invites.length > 0 ? `${invites.length} ${invites.length === 1 ? "invite" : "invites"}` : undefined}
        title="Your invites"
        description={invites.length > 0 ? "Open one to change the plan or send its link again." : undefined}
      />
      {!user.canDm && (
        <Note tone="warn" className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span>
            The bot can&apos;t message you yet. Open it and press <b>Start</b>, so the answers reach you.
          </span>
          {botUsername && (
            <a href={`https://t.me/${botUsername}?start=hello`} target="_blank" rel="noopener noreferrer" className={buttonClass("telegram", "sm")}>
              Open @{botUsername}
            </a>
          )}
        </Note>
      )}
      <InviteList invites={invites} siteUrl={SITE_URL} />
    </>
  );
}
