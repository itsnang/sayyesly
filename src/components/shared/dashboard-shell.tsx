import Link from "next/link";
import type { ReactNode } from "react";

/** Header + page frame for everything under /dashboard. */
export function DashboardShell({ userName, children }: { userName: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b-2 border-[var(--line)]/20 bg-[var(--paper)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="font-[family-name:var(--hand)] text-2xl font-bold text-[var(--accent)]">
            ask her out
          </Link>
          <nav className="ml-2 flex gap-1 text-sm">
            <Link href="/dashboard" className="rounded-lg px-2 py-1 text-[var(--ink-soft)] hover:bg-[var(--paper-2)]">
              invites
            </Link>
            <Link href="/dashboard/themes" className="rounded-lg px-2 py-1 text-[var(--ink-soft)] hover:bg-[var(--paper-2)]">
              themes
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden max-w-[10rem] truncate text-[var(--ink-soft)] sm:inline">{userName}</span>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="rounded-lg px-2 py-1 text-[var(--ink-soft)] hover:bg-[var(--paper-2)]">
                log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
