import { renderInviteOgImage } from "@/features/invites/server/og-image";
import { OG_IMAGE_SIZE } from "@/features/invites/themes";

export const alt = "someone has a question for you 💌";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderInviteOgImage(slug);
}
