import type { Metadata } from "next";
import { InviteView } from "@/features/invites/components/invite-view";
import { inviteMetadata } from "@/features/invites/server/metadata";

export async function generateMetadata({ params }: PageProps<"/invite/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return inviteMetadata(slug, `/invite/${slug}`);
}

export default async function InvitePage({ params }: PageProps<"/invite/[slug]">) {
  const { slug } = await params;
  return <InviteView slug={slug} />;
}
