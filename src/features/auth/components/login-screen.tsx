import Link from "next/link";
import { Cat, Cloud, Heart, Sparkle } from "@/components/shared/doodles";
import { Wordmark } from "@/components/shared/studio";

const ERRORS: Record<string, string> = {
  expired: "That login took too long or was opened in another browser. Please try again.",
  failed: "Telegram couldn't log you in. Please try again.",
};

/** "Log in with Telegram": the only way in. */
export function LoginScreen({ next, error }: { next: string; error: string | null }) {
  const href = `/api/auth/telegram?next=${encodeURIComponent(next)}`;
  return (
    <div className="studio flex w-full flex-col">
      <header className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
        <Link href="/" aria-label="ask her out, home">
          <Wordmark />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-20">
        <div className="relative w-full max-w-[380px]">
          <Cloud aria-hidden fill="var(--color-sky)" className="absolute -top-10 -left-8 w-14 text-ink" />
          <Sparkle aria-hidden className="absolute -top-6 -right-4 size-7 text-ink" />
          <Heart aria-hidden className="absolute -right-8 bottom-24 size-6 text-rose max-sm:hidden" />

          <div className="relative rounded-[20px] border-[1.5px] border-ink bg-card px-6 pt-8 pb-7 text-center shadow-[5px_6px_0_var(--color-rose-soft)]">
            <h1 className="font-display text-[32px] leading-tight text-ink">Hello again</h1>
            <p className="mt-2 text-[15px] leading-snug text-muted">
              Log in to write an invite and hear the answer on Telegram.
            </p>

            {error && (
              <p role="alert" className="mt-5 rounded-lg bg-rose-soft px-3 py-2 text-[13.5px] text-rose-deep">
                {ERRORS[error] ?? ERRORS.failed}
              </p>
            )}

            <a
              href={href}
              className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#2aabee] px-4 py-3 text-[15px] font-medium text-white transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="currentColor">
                <path d="M9.8 15.3 9.6 19c.4 0 .6-.2.8-.4l2-1.9 4.1 3c.8.4 1.3.2 1.5-.7l2.7-12.7c.3-1.1-.4-1.6-1.1-1.3L3.7 10.7c-1.1.4-1.1 1-.2 1.3l4.1 1.3 9.5-6c.4-.3.9-.1.6.2" />
              </svg>
              Log in with Telegram
            </a>
            <p className="mt-4 font-mono text-[11.5px] leading-relaxed text-muted">
              we only see your telegram name and photo.
              <br />
              the bot will message you when someone answers.
            </p>
          </div>

          <Cat aria-hidden className="absolute -bottom-2 -left-24 w-24 text-ink max-sm:hidden" />
        </div>
      </main>
    </div>
  );
}
