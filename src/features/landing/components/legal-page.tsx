import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/shared/studio";
import { LEGAL_UPDATED, SUPPORT_HANDLE, SUPPORT_URL } from "@/lib/site";

/** The shared layout of the Terms, Privacy and Refunds pages: plain, readable, one column. */
export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="studio min-h-svh w-full bg-canvas">
      <header className="mx-auto flex max-w-[720px] items-center justify-between px-5 pt-6 sm:px-8">
        <Link href="/" aria-label="sayyesly, home">
          <Wordmark className="h-[34px] w-auto" />
        </Link>
        <nav aria-label="Legal" className="flex gap-4 text-[13px] text-muted">
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/refunds" className="hover:text-ink">Refunds</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-[720px] px-5 pt-12 pb-20 sm:px-8">
        <h1 className="font-display text-[clamp(32px,6vw,44px)] leading-tight text-ink">{title}</h1>
        <p className="mt-2 text-[13px] text-muted">Last updated {LEGAL_UPDATED}</p>
        <p className="mt-6 text-[16px] leading-relaxed text-ink">{intro}</p>
        <div className="legal mt-8 grid gap-8 text-[15px] leading-relaxed text-ink/90">{children}</div>
        <p className="mt-12 border-t border-ink/10 pt-6 text-[14px] text-muted">
          Questions? Message us on Telegram at{" "}
          <a href={SUPPORT_URL} className="text-ink underline underline-offset-4">
            {SUPPORT_HANDLE}
          </a>
          .
        </p>
      </main>
    </div>
  );
}

/** One titled part of a legal page. */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
      <div className="mt-2 grid gap-3 [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-1.5">{children}</div>
    </section>
  );
}

/** The support link, inline in a sentence. */
export function Support() {
  return (
    <a href={SUPPORT_URL} className="underline underline-offset-4">
      {SUPPORT_HANDLE} on Telegram
    </a>
  );
}
