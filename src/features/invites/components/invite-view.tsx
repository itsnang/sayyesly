import { notFound } from "next/navigation";
import { TrackOnMount } from "@/lib/analytics/track-on-mount";
import { getCurrentUser } from "@/lib/auth/session";
import { submitAnswer } from "../actions";
import { getInviteCreatorId, getPublicInvite } from "../server/data";
import { getTheme } from "../themes";
import { ExpiredScreen } from "./expired-screen";
import { PreviewBanner } from "./preview-banner";

/** Server-renders an Invite in its Theme, or the not-found page when it doesn't exist. */
export async function InviteView({ slug }: { slug: string }) {
  const invite = await getPublicInvite(slug);
  if (!invite) notFound();

  const theme = getTheme(invite.themeId);
  if (!theme) throw new Error(`Theme "${invite.themeId}" is in the database but not in the theme registry`);

  const [viewer, creatorId] = await Promise.all([getCurrentUser(), getInviteCreatorId(slug)]);
  const isPreview = viewer !== null && viewer.id === creatorId;

  return (
    <>
      {isPreview && <PreviewBanner />}
      {!isPreview && !invite.expired && <TrackOnMount event="invite_opened" props={{ theme: invite.themeId }} />}
      {invite.expired ? (
        <ExpiredScreen />
      ) : (
        <theme.Invite invite={invite} submitAnswer={submitAnswer.bind(null, invite.slug)} />
      )}
    </>
  );
}
