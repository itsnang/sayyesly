import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/shared/ui";
import { DeleteInviteButton } from "@/features/invites/components/dashboard/delete-invite-button";
import { InviteEditor } from "@/features/invites/components/dashboard/editor/invite-editor";
import { SharePanel } from "@/features/invites/components/dashboard/share-panel";
import { getMyInvite } from "@/features/invites/server/dashboard-data";
import { getThemeChoices } from "@/features/invites/server/theme-access";
import { requireUser } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/site";
import { isUploadConfigured } from "@/lib/storage/r2";
import { getBotUsername } from "@/lib/telegram";
import { isId } from "@/lib/validation";

export default async function EditInvitePage({ params, searchParams }: PageProps<"/dashboard/invites/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const user = await requireUser(`/dashboard/invites/${id}`);
  // Ownership: getMyInvite only returns the Invite if this Creator made it.
  const invite = isId(id) ? await getMyInvite(id, user.id) : null;
  if (!invite) notFound();

  const [themes, botUsername] = await Promise.all([getThemeChoices(user.id), getBotUsername().catch(() => null)]);
  const shareUrl = new URL(`/i/${invite.slug}`, SITE_URL).toString();

  return (
    <>
      <Link href="/dashboard" className="mb-4 inline-block text-[13.5px] text-muted hover:text-ink">
        ← All invites
      </Link>
      <PageHeading
        title={`For ${invite.values.recipientName}`}
        description={invite.answered ? "They've answered. You can still change the plan." : "Waiting for their answer."}
      />
      <div className="mb-12">
        <SharePanel
          shareUrl={shareUrl}
          linkCode={invite.linkCode}
          botUsername={botUsername}
          recipientName={invite.values.recipientName}
          justCreated={query.created === "1"}
        />
      </div>

      <h2 className="mb-6 font-display text-[24px] text-ink">Edit the invite</h2>
      <InviteEditor
        inviteId={invite.id}
        defaults={invite.values}
        answered={invite.answered}
        themes={themes}
        uploadsEnabled={isUploadConfigured()}
      />

      <div className="mt-14 border-t border-dashed border-ink/20 pt-6">
        <DeleteInviteButton inviteId={invite.id} />
      </div>
    </>
  );
}
