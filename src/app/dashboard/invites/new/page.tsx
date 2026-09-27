import { InviteStudio } from "../_components/invite-studio";
import type { InviteFormValues } from "@/features/invites/schemas";
import { getThemeChoices } from "@/features/invites/server/theme-access";
import { DEFAULT_THEME_ID } from "@/features/invites/themes";
import { DEFAULT_TIME_OF_DAY } from "@/features/invites/utils/time-of-day";
import { requireUser } from "@/lib/auth/session";
import { isUploadConfigured } from "@/lib/storage/r2";

const NEW_INVITE: InviteFormValues = {
  recipientName: "",
  // Empty: the preview shows the selected Theme's example headline until they write their own.
  question: "",
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
  timeOfDay: DEFAULT_TIME_OF_DAY,
  timeSlots: [],
  themeId: DEFAULT_THEME_ID,
};

export default async function NewInvitePage() {
  const user = await requireUser("/dashboard/invites/new");
  const themes = await getThemeChoices(user.id);
  return <InviteStudio inviteId={null} defaults={NEW_INVITE} answered={false} themes={themes} uploadsEnabled={isUploadConfigured()} />;
}
