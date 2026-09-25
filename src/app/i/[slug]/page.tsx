import { permanentRedirect } from "next/navigation";

// The old share-link path. Kept so links already sent before the /invite/
// rename (Telegram messages, past shares) keep working, forever.
export default async function OldInvitePath({ params }: PageProps<"/i/[slug]">) {
  const { slug } = await params;
  permanentRedirect(`/invite/${slug}`);
}
