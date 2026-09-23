import { PageHeading } from "@/components/shared/ui";
import { ThemeShop } from "@/features/billing/components/theme-shop";
import { listThemesForSale } from "@/features/billing/server/data";
import { hasTheme } from "@/features/invites/themes";
import { requireUser } from "@/lib/auth/session";

export default async function ThemesPage() {
  const user = await requireUser("/dashboard/themes");
  // Only sell Themes this build can actually render.
  const themes = (await listThemesForSale(user.id)).filter((t) => hasTheme(t.id));
  return (
    <>
      <PageHeading title="themes" description="Pay once with KHQR; the theme is yours for every invite." />
      <ThemeShop themes={themes} />
    </>
  );
}
