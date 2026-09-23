import { notFound } from "next/navigation";
import { PageHeading } from "@/components/shared/ui";
import { DeleteInviteButton } from "@/features/invites/components/dashboard/delete-invite-button";
import { InviteForm } from "@/features/invites/components/dashboard/invite-form";
import { SharePanel } from "@/features/invites/components/dashboard/share-panel";
import { getMyInvite } from "@/features/invites/dashboard-data";
import { getThemeChoices } from "@/features/invites/theme-access";
import { requireUser } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/site";
import { isUploadConfigured } from "@/lib/storage/r2";
import { getBotUsername } from "@/lib/telegram";

export default async function EditInvitePage({ params }: PageProps<"/dashboard/invites/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/dashboard/invites/${id}`);
  // Ownership: getMyInvite only returns the Invite if this Creator made it.
  const invite = /^[0-9a-f-]{36}$/i.test(id) ? await getMyInvite(id, user.id) : null;
  if (!invite) notFound();

  const [themes, botUsername] = await Promise.all([getThemeChoices(user.id), getBotUsername().catch(() => null)]);

  return (
    <>
      <PageHeading title={`for ${invite.values.recipientName}`} description={invite.answered ? "Answered. You can still update the plan." : "Waiting for an answer."} />
      <div className="mb-6">
        <SharePanel shareUrl={new URL(`/i/${invite.slug}`, SITE_URL).toString()} linkCode={invite.linkCode} botUsername={botUsername} />
      </div>
      <InviteForm
        inviteId={invite.id}
        defaults={invite.values}
        answered={invite.answered}
        themes={themes}
        uploadsEnabled={isUploadConfigured()}
      />
      <div className="mt-8 border-t-2 border-[var(--line)]/15 pt-6">
        <DeleteInviteButton inviteId={invite.id} />
      </div>
    </>
  );
}
