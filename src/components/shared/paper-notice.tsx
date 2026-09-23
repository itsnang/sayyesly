import Link from "next/link";
import type { ReactNode } from "react";
import { Cat, Sparkle } from "./doodles";
import { Wordmark } from "./studio";
import { buttonClass } from "./ui";

/** A full-page, calm message on the product paper (expired invite, not found, …). */
export function PaperNotice({ title, children, action }: { title: string; children: ReactNode; action?: { href: string; label: string } }) {
  return (
    <div className="studio flex w-full flex-col">
      <header className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
        <Link href="/">
          <Wordmark />
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-5 pb-24 text-center">
        <div className="relative">
          <Cat aria-hidden className="mx-auto w-28 text-ink" />
          <Sparkle aria-hidden className="absolute -top-2 -right-8 size-6 text-ink" />
        </div>
        <h1 className="mt-6 font-display text-[clamp(28px,4vw,40px)] leading-tight text-ink">{title}</h1>
        <p className="mt-3 max-w-sm text-[15.5px] leading-relaxed text-muted">{children}</p>
        {action && (
          <Link href={action.href} className={buttonClass("primary", "md", "mt-7 px-5")}>
            {action.label}
          </Link>
        )}
      </main>
    </div>
  );
}
