import { Heart } from "@/components/shared/doodles";
import { InkButton } from "@/components/shared/studio";
import { PageHeading } from "@/components/shared/ui";
import { InviteList } from "@/features/invites/components/dashboard/invite-list";
import { listMyInvites } from "@/features/invites/server/dashboard-data";
import { requireUser } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/site";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const invites = await listMyInvites(user.id);
  return (
    <>
      <PageHeading
        title="Your invites"
        description={invites.length > 0 ? "Tap one to change the plan or grab its link." : undefined}
        action={
          invites.length > 0 ? (
            <InkButton href="/dashboard/invites/new">
              New invite <Heart className="size-3.5 text-rose" strokeWidth={2.4} />
            </InkButton>
          ) : undefined
        }
      />
      {!user.canDm && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
          The bot can&apos;t message you yet. Open it in Telegram and press <b>Start</b>, so you hear the answers.
        </p>
      )}
      <InviteList invites={invites} siteUrl={SITE_URL} />
    </>
  );
}
