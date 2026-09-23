import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginScreen } from "@/features/auth/components/login-screen";
import { getCurrentUser, safeNextPath } from "@/lib/auth/session";
import { isTelegramLoginConfigured } from "@/lib/auth/telegram";

export const metadata: Metadata = { title: "log in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  if (await getCurrentUser()) redirect(next);
  return (
    <LoginScreen
      next={next}
      error={typeof params.error === "string" ? params.error : null}
      available={isTelegramLoginConfigured()}
    />
  );
}
