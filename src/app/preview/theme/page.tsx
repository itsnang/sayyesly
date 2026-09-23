import type { Metadata } from "next";
import { ThemePreview } from "@/features/invites/components/theme-preview";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "preview", robots: { index: false, follow: false } };

// Loaded inside the invite editor's iframe.
export default async function ThemePreviewPage() {
  await requireUser("/dashboard");
  return <ThemePreview />;
}
