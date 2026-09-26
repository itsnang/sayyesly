import Link from "next/link";
import { Cat, Cloud, Heart, Sparkle } from "@/components/shared/doodles";
import { Tape, Wordmark } from "@/components/shared/studio";
import { buttonClass } from "@/components/shared/ui";

const ERRORS: Record<string, string> = {
  expired: "That login took too long or was opened in another browser. Please try again.",
  failed: "Telegram couldn't log you in. Please try again.",
  unavailable: "Logging in isn't switched on yet. Please try again a little later.",
};

/** "Log in with Telegram": the only way in. */
export function LoginScreen({ next, error, available }: { next: string; error: string | null; available: boolean }) {
  const href = `/api/auth/telegram?next=${encodeURIComponent(next)}`;
  return (
    <div className="studio flex w-full flex-col">
      <main className="flex min-h-svh flex-1 flex-col items-center justify-center px-5 py-10">
        {/* The image has wide transparent margins; the negative margins bring the lettering close to the card. */}
        <Link href="/" aria-label="sayyesly, home" className="-mt-2 -mb-2 sm:-mb-4">
          <Wordmark className="h-32 w-auto sm:h-40" priority />
        </Link>

        <div className="relative w-full max-w-[420px]">
          <Cloud aria-hidden fill="var(--color-sky)" className="absolute -top-9 left-1 w-14 text-ink sm:-left-9" />
          <Sparkle aria-hidden className="absolute -top-7 right-1 size-7 text-ink sm:-right-5" />
          <Heart aria-hidden className="absolute -right-9 bottom-28 size-6 text-rose max-sm:hidden" />
          <Cat aria-hidden className="absolute -bottom-2 -left-28 w-24 text-ink max-sm:hidden" />

          <div className="relative rounded-[8px] border-[1.5px] border-ink bg-card px-7 pt-10 pb-8 text-center shadow-[5px_5px_0_var(--color-ink)]">
            <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-2" />

            <h1 className="font-display text-[38px] leading-tight text-ink">Hello again</h1>
            <p className="mt-2.5 text-[16px] leading-snug text-ink/80">
              Log in to write an invite and hear the answer on Telegram.
            </p>

            {(error || !available) && (
              <p
                role="alert"
                className="mt-5 rounded-[6px] border-[1.5px] border-dashed border-rose-deep/50 bg-rose-soft px-3 py-2.5 text-left text-[14px] text-rose-deep"
              >
                {!available ? ERRORS.unavailable : (ERRORS[error ?? ""] ?? ERRORS.failed)}
              </p>
            )}

            {available && (
              <a href={href} className={buttonClass("telegram", "md", "mt-7 w-full gap-2.5 py-3.5 text-[16px]")}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
                  <path d="M9.8 15.3 9.6 19c.4 0 .6-.2.8-.4l2-1.9 4.1 3c.8.4 1.3.2 1.5-.7l2.7-12.7c.3-1.1-.4-1.6-1.1-1.3L3.7 10.7c-1.1.4-1.1 1-.2 1.3l4.1 1.3 9.5-6c.4-.3.9-.1.6.2" />
                </svg>
                Log in with Telegram
              </a>
            )}

            <p className="mt-5 text-[13px] leading-relaxed text-muted">
              we only see your telegram name and photo.
              <br />
              the bot will message you when someone answers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
