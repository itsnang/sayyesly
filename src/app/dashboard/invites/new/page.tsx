import { InviteStudio } from "../_components/invite-studio";
import { getThemeChoices } from "@/features/invites/server/theme-choices";
import { DEFAULT_THEME_ID } from "@/features/invites/themes";
import { blankInviteForm } from "@/features/invites/utils/invite-content";
import { requireUser } from "@/lib/auth/session";
import { isUploadConfigured } from "@/lib/storage/r2";

const NEW_INVITE = blankInviteForm(DEFAULT_THEME_ID);

export default async function NewInvitePage() {
  const user = await requireUser("/dashboard/invites/new");
  const themes = await getThemeChoices(user.id);
  return <InviteStudio inviteId={null} defaults={NEW_INVITE} answered={false} themes={themes} uploadsEnabled={isUploadConfigured()} />;
}
