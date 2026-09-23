import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/shared/ui";
import { InviteStudio } from "../_components/invite-studio";
import { DeleteInviteButton } from "@/features/invites/components/dashboard/delete-invite-button";
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
      <PageHeading
        eyebrow={
          <Link href="/dashboard" className="hover:text-ink">
            ← All invites
          </Link>
        }
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

      <div className="mb-8 flex items-center gap-4">
        <h2 className="font-mono text-[12px] tracking-[0.12em] text-muted uppercase">Edit the invite</h2>
        <span aria-hidden className="h-[1.5px] flex-1 bg-ink/20" />
      </div>
      <InviteStudio
        inviteId={invite.id}
        defaults={invite.values}
        answered={invite.answered}
        themes={themes}
        uploadsEnabled={isUploadConfigured()}
      />

      <div className="mt-14 border-t-[1.5px] border-dashed border-ink/20 pt-6">
        <DeleteInviteButton inviteId={invite.id} />
      </div>
    </>
  );
}
