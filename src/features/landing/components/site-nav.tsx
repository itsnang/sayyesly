import Link from "next/link";
import { CtaLocation } from "@/lib/analytics/events";
import { trackClick } from "@/lib/analytics/track";
import { Wordmark } from "@/components/shared/studio";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 py-4 text-[14px] sm:px-8">
        <nav aria-label="Sections" className="hidden gap-6 whitespace-nowrap text-muted lg:flex">
          <a href="#how" className="hover:text-ink">How it goes</a>
          <a href="#studio" className="hover:text-ink">Studio</a>
          <a href="#themes" className="hover:text-ink">Themes</a>
          <a href="#pricing" className="hover:text-ink">Pricing</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <Link href="/" aria-label="sayyesly, home" className="col-start-1 justify-self-start lg:col-start-2 lg:justify-self-center">
          <Wordmark className="h-9 w-auto sm:h-11" />
        </Link>
        <div className="col-start-3 flex items-center justify-end gap-3 whitespace-nowrap sm:gap-4">
          <Link href="/login" className="inline-block py-2 text-muted hover:text-ink">
            Log in
          </Link>
          <Link
            href="/dashboard/invites/new"
            {...trackClick("make_invite_clicked", { location: CtaLocation.Nav })}
            className="rounded-[6px] border-[1.5px] border-ink px-4 py-1.5 text-ink transition hover:bg-ink hover:text-canvas max-sm:px-3 max-sm:text-[13px]"
          >
            Make an invite
          </Link>
        </div>
      </div>
    </header>
  );
}
