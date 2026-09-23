"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "./studio";
import { buttonClass, cx } from "./ui";

const NAV = [
  { href: "/dashboard", label: "Invites", match: (p: string) => p === "/dashboard" || (p.startsWith("/dashboard/invites/") && !p.endsWith("/new")) },
  { href: "/dashboard/themes", label: "Themes", match: (p: string) => p.startsWith("/dashboard/themes") },
];

/** Header + page frame for everything under /dashboard: the landing's paper, kept quiet. */
export function DashboardShell({ userName, photoUrl, children }: { userName: string; photoUrl: string | null; children: ReactNode }) {
  const pathname = usePathname();
  const writing = pathname === "/dashboard/invites/new";
  const studio = /^\/dashboard\/invites\/[^/]+$/.test(pathname);
  // The invite editor is a full-screen studio with its own single bar.
  if (studio) return <div className="studio w-full">{children}</div>;

  return (
    <div className="studio w-full">
      <header className="sticky top-0 z-30 border-b-[1.5px] border-ink bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-1.5 px-4 sm:gap-2 sm:px-8">
          <Link href="/dashboard" className="mr-0.5 shrink-0 sm:mr-6" aria-label="ask her out, your invites">
            <Wordmark className="text-[20px] max-sm:text-[17px]" />
          </Link>
          <nav aria-label="Dashboard" className="flex h-full">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "relative flex items-center px-2 text-[14px] transition-colors sm:px-2.5",
                    active ? "font-medium text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                  {active && <span aria-hidden className="absolute inset-x-2 -bottom-[1.5px] sm:inset-x-2.5 h-[3px] bg-rose" />}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {!writing && (
              <Link href="/dashboard/invites/new" className={buttonClass("primary", "sm", "max-sm:px-2.5")}>
                <span aria-hidden>+</span> New<span className="max-sm:hidden"> invite</span>
              </Link>
            )}
            <details className="relative">
              <summary
                aria-label={`Account: ${userName}`}
                className="grid size-8 cursor-pointer list-none place-items-center overflow-hidden rounded-[6px] border-[1.5px] border-ink bg-rose-soft text-[13px] font-semibold text-rose-deep [&::-webkit-details-marker]:hidden"
              >
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Telegram-hosted avatar
                  <img src={photoUrl} alt="" className="size-full object-cover" />
                ) : (
                  userName.slice(0, 1).toUpperCase()
                )}
              </summary>
              <div className="absolute top-full right-0 mt-2 w-52 rounded-[8px] border-[1.5px] border-ink bg-card p-1.5 shadow-[4px_4px_0_var(--color-ink)]">
                <p className="truncate px-2.5 pt-1.5 pb-2 text-[13px] text-muted">{userName}</p>
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="w-full rounded-[5px] px-2.5 py-2 text-left text-[14px] text-ink hover:bg-surface">
                    Log out
                  </button>
                </form>
              </div>
            </details>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-8 sm:pt-12">{children}</main>
    </div>
  );
}
