import { PageHeading } from "@/components/shared/ui";
import { InviteForm } from "@/features/invites/components/dashboard/invite-form";
import type { InviteFormValues } from "@/features/invites/schemas";
import { getThemeChoices } from "@/features/invites/server/theme-access";
import { DEFAULT_THEME_ID } from "@/features/invites/themes";
import { requireUser } from "@/lib/auth/session";
import { isUploadConfigured } from "@/lib/storage/r2";

const NEW_INVITE: InviteFormValues = {
  recipientName: "",
  question: "will you have *dinner* with me?",
  message: "",
  imageUrl: "",
  planPlace: "",
  planActivity: "",
  planMapUrl: "",
  planDressCode: "",
  planNotes: "",
  planPhotos: [],
  timezone: "Asia/Phnom_Penh",
  allowCustomTime: true,
  timeSlots: [],
  themeId: DEFAULT_THEME_ID,
};

export default async function NewInvitePage() {
  const user = await requireUser("/dashboard/invites/new");
  const themes = await getThemeChoices(user.id);
  return (
    <>
      <PageHeading title="new invite" description="Write it, preview it, then send the link." />
      <InviteForm inviteId={null} defaults={NEW_INVITE} answered={false} themes={themes} uploadsEnabled={isUploadConfigured()} />
    </>
  );
}
