"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "./studio";

const NAV = [
  { href: "/dashboard", label: "Invites", match: (p: string) => p === "/dashboard" || p.startsWith("/dashboard/invites") },
  { href: "/dashboard/themes", label: "Themes", match: (p: string) => p.startsWith("/dashboard/themes") },
];

/** Header + page frame for everything under /dashboard: the landing's paper, kept quiet. */
export function DashboardShell({ userName, photoUrl, children }: { userName: string; photoUrl: string | null; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="studio w-full">
      <header className="sticky top-0 z-30 border-b-[1.5px] border-ink/80 bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
          <Link href="/dashboard" className="shrink-0">
            <Wordmark className="text-[20px]" />
          </Link>
          <nav aria-label="Dashboard" className="ml-3 flex gap-1 sm:ml-8">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-2.5 py-1.5 text-[14px] transition-colors ${active ? "text-ink" : "text-muted hover:text-ink"}`}
                >
                  {item.label}
                  {active && (
                    <svg viewBox="0 0 60 8" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-x-1.5 -bottom-0.5 h-1.5 w-[calc(100%-12px)] text-rose">
                      <path d="M2 5c9-3 18-3 27-.6 9 2.3 19 2.1 29-1.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden max-w-[10rem] truncate text-[13px] text-muted sm:inline">{userName}</span>
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Telegram-hosted avatar
              <img src={photoUrl} alt="" className="size-8 rounded-full border border-ink/20 object-cover" />
            ) : (
              <span className="grid size-8 place-items-center rounded-full bg-rose-soft text-[13px] font-medium text-rose-deep">
                {userName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="px-1.5 py-1.5 text-[13px] text-muted hover:text-ink">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-8 sm:pt-12">{children}</main>
    </div>
  );
}
