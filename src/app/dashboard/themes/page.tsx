import { PageHeading } from "@/components/shared/ui";
import { ThemeShop } from "@/features/billing/components/theme-shop";
import { listThemesForSale } from "@/features/billing/server/data";
import { getTheme } from "@/features/invites/themes";
import { requireUser } from "@/lib/auth/session";

export default async function ThemesPage() {
  const user = await requireUser("/dashboard/themes");
  // Only sell Themes this build can actually render.
  const themes = (await listThemesForSale(user.id)).flatMap((t) => {
    const def = getTheme(t.id);
    return def ? [{ ...t, thumbnail: def.thumbnail }] : [];
  });
  return (
    <>
      <PageHeading
        eyebrow="The look they open"
        title="Themes"
        description="Pay once by scanning a KHQR code in your banking app. The theme is yours for every invite after that."
      />
      <ThemeShop themes={themes} />
    </>
  );
}
