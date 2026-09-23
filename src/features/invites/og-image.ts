import "server-only";
import { getPublicInvite } from "./data";
import { DEFAULT_THEME_ID, getTheme } from "./themes";
import { parseQuestion } from "./utils";

const FALLBACK_QUESTION = parseQuestion("a question, just for *you*");

/** The Invite's link-preview image, drawn by its Theme. */
export async function renderInviteOgImage(slug: string) {
  const invite = await getPublicInvite(slug);
  const theme = (invite && getTheme(invite.themeId)) ?? getTheme(DEFAULT_THEME_ID);
  if (!theme) throw new Error("Default theme missing from the theme registry");
  return theme.renderOgImage({ question: invite?.question ?? FALLBACK_QUESTION });
}
