import type { Metadata } from "next";
import { InviteView } from "@/features/invites/components/invite-view";
import { HOME_INVITE_SLUG } from "@/features/invites/home-invite";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";

// Until the landing page arrives in Phase 4, `/` shows the original invite.
export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return <InviteView slug={HOME_INVITE_SLUG} />;
}
