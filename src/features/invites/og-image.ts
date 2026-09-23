import "server-only";
import { getPublicInvite } from "./data";
import { DEFAULT_THEME_ID } from "./themes";
import { getOgImageRenderer } from "./themes/og-images";
import { parseQuestion } from "./utils";

const FALLBACK_QUESTION = parseQuestion("a question, just for *you*");

/** The Invite's link-preview image, drawn by its Theme. */
export async function renderInviteOgImage(slug: string) {
  const invite = await getPublicInvite(slug);
  const render = (invite && getOgImageRenderer(invite.themeId)) ?? getOgImageRenderer(DEFAULT_THEME_ID);
  if (!render) throw new Error("Default theme has no link-preview renderer");
  return render({ question: invite?.question ?? FALLBACK_QUESTION });
}

/** The site-wide link-preview image, drawn by the default Theme. */
export async function renderSiteOgImage(question: string) {
  const render = getOgImageRenderer(DEFAULT_THEME_ID);
  if (!render) throw new Error("Default theme has no link-preview renderer");
  return render({ question: parseQuestion(question) });
}
