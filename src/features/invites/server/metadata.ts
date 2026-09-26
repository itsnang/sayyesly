import "server-only";
import type { Metadata } from "next";
import { getPublicInvite } from "./data";
import { questionText } from "../utils";

const DESCRIPTION = "someone has a question for you 💌";

/** Link-preview metadata for an Invite. Reveals the question only, never the Recipient's name. */
export async function inviteMetadata(slug: string, path: string): Promise<Metadata> {
  const invite = await getPublicInvite(slug);
  if (!invite) return { title: "invite not found", robots: { index: false, follow: false } };

  const title = questionText(invite.question);
  return {
    // The Recipient's tab shows just the question, without the site's " · sayyesly" suffix.
    title: { absolute: title },
    description: DESCRIPTION,
    alternates: { canonical: path },
    robots: { index: false, follow: false },
    openGraph: { type: "website", url: path, title, description: DESCRIPTION },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION },
  };
}
