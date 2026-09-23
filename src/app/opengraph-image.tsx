import { kittenSoft } from "@/features/invites/themes/kitten-soft";
import { OG_IMAGE_SIZE } from "@/features/invites/themes";
import { parseQuestion } from "@/features/invites/utils";
import { SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return kittenSoft.renderOgImage({ question: parseQuestion("will you have *dinner* with me?") });
}
