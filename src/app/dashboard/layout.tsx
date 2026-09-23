import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "dashboard", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return <DashboardShell userName={user.name}>{children}</DashboardShell>;
}
