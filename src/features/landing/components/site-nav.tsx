import Link from "next/link";
import { Wordmark } from "@/components/shared/studio";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 py-4 text-[14px] sm:px-8">
        <nav aria-label="Sections" className="hidden gap-6 text-muted md:flex">
          <a href="#how" className="hover:text-ink">How it goes</a>
          <a href="#themes" className="hover:text-ink">Themes</a>
          <a href="#pricing" className="hover:text-ink">Pricing</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <Link href="/" aria-label="ask her out, home" className="col-start-1 justify-self-start md:col-start-2 md:justify-self-center">
          <Wordmark />
        </Link>
        <div className="col-start-3 flex items-center justify-end gap-4">
          <Link href="/login" className="text-muted hover:text-ink">
            Log in
          </Link>
          <Link
            href="/dashboard/invites/new"
            className="rounded-full border-[1.5px] border-ink px-4 py-1.5 text-ink transition hover:bg-ink hover:text-canvas max-sm:px-3 max-sm:text-[13px]"
          >
            Make an invite
          </Link>
        </div>
      </div>
    </header>
  );
}
