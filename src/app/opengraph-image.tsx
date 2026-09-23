import { renderSiteOgImage } from "@/features/invites/server/og-image";
import { OG_IMAGE_SIZE } from "@/features/invites/themes";
import { SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return renderSiteOgImage("will you have *dinner* with me?");
}
