import { notFound } from "next/navigation";
import { InviteStudio } from "../_components/invite-studio";
import { Note } from "@/components/shared/ui";
import { DeleteInviteButton } from "@/features/invites/components/dashboard/delete-invite-button";
import { DuplicateInviteButton } from "@/features/invites/components/dashboard/duplicate-invite-button";
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
  const shareUrl = new URL(`/invite/${invite.slug}`, SITE_URL).toString();
  const themeName = themes.find((t) => t.id === invite.values.themeId)?.name ?? "the free theme";

  return (
    <InviteStudio
      // A new Answer locks fields; remount so the form starts from the saved Invite.
      key={invite.answered ? "answered" : "open"}
      inviteId={invite.id}
      defaults={invite.values}
      answered={invite.answered}
      themes={themes}
      uploadsEnabled={isUploadConfigured()}
      shareOpen={query.created === "1"}
      notice={
        query.themeSwapped === "1" ? (
          <Note tone="warn">The theme this was copied from isn&apos;t available anymore, so this invite uses {themeName} instead.</Note>
        ) : (
          query.answeredWhileEditing === "1" &&
          invite.answered && (
            <Note tone="warn">They answered while you were editing, so only the plan was saved. The question, times and theme stay as they answered them.</Note>
          )
        )
      }
      share={
        <SharePanel
          shareUrl={shareUrl}
          linkCode={invite.linkCode}
          botUsername={botUsername}
          recipientName={invite.values.recipientName}
          linkedGroups={invite.linkedGroups}
          canDm={user.canDm}
          justCreated={query.created === "1"}
        />
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DuplicateInviteButton inviteId={invite.id} />
          <DeleteInviteButton inviteId={invite.id} />
        </div>
      }
    />
  );
}
