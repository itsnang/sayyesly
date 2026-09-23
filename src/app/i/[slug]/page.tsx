import type { Metadata } from "next";
import { InviteView } from "@/features/invites/components/invite-view";
import { inviteMetadata } from "@/features/invites/metadata";

export async function generateMetadata({ params }: PageProps<"/i/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return inviteMetadata(slug, `/i/${slug}`);
}

export default async function InvitePage({ params }: PageProps<"/i/[slug]">) {
  const { slug } = await params;
  return <InviteView slug={slug} />;
}
