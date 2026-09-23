import { ButtonLink, PageHeading } from "@/components/shared/ui";
import { InviteList } from "@/features/invites/components/dashboard/invite-list";
import { listMyInvites } from "@/features/invites/dashboard-data";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const invites = await listMyInvites(user.id);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeading title="your invites" description="Tap one to edit it or grab its link." />
        {invites.length > 0 && (
          <ButtonLink href="/dashboard/invites/new" className="mb-5">
            new invite ✦
          </ButtonLink>
        )}
      </div>
      {!user.canDm && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          I can&apos;t message you on Telegram yet. Open the bot and press <b>Start</b> so you hear the answers.
        </p>
      )}
      <InviteList invites={invites} />
    </>
  );
}
