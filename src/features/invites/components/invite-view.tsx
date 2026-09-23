import { notFound } from "next/navigation";
import { submitAnswer } from "../actions";
import { getPublicInvite } from "../data";
import { getTheme } from "../themes";

/** Server-renders an Invite in its Theme, or the not-found page when it doesn't exist. */
export async function InviteView({ slug }: { slug: string }) {
  const invite = await getPublicInvite(slug);
  if (!invite) notFound();

  const theme = getTheme(invite.themeId);
  if (!theme) throw new Error(`Theme "${invite.themeId}" is in the database but not in the theme registry`);

  return <theme.Invite invite={invite} submitAnswer={submitAnswer.bind(null, invite.slug)} />;
}
