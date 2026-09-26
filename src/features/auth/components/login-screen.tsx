import Image from "next/image";
import Link from "next/link";

const ERRORS: Record<string, string> = {
  expired: "That login took too long or was opened in another browser. Please try again.",
  failed: "Telegram couldn't log you in. Please try again.",
  unavailable: "Logging in isn't switched on yet. Please try again a little later.",
};

/** "Log in with Telegram": the only way in. */
export function LoginScreen({ next, error, available }: { next: string; error: string | null; available: boolean }) {
  const href = `/api/auth/telegram?next=${encodeURIComponent(next)}`;
  return (
    <div className="studio grid min-h-svh w-full lg:grid-cols-2">
      <main className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" aria-label="sayyesly, home" className="inline-flex items-center gap-2.5">
            <Image src="/brand/app-icon-dark.png" alt="" width={36} height={36} className="size-9 rounded-lg" />
            <span className="text-[18px] font-semibold tracking-tight text-ink">sayyesly</span>
          </Link>

          <h1 className="mt-12 font-display text-[38px] leading-tight text-ink">Hello again</h1>
          <p className="mt-2.5 text-[16px] leading-snug text-muted">
            Log in to write an invite and hear the answer on Telegram.
          </p>

          {(error || !available) && (
            <p
              role="alert"
              className="mt-6 rounded-lg border border-rose-deep/30 bg-rose-soft px-3.5 py-2.5 text-[14px] text-rose-deep"
            >
              {!available ? ERRORS.unavailable : (ERRORS[error ?? ""] ?? ERRORS.failed)}
            </p>
          )}

          {available && (
            <a
              href={href}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-[#2aabee] text-[16px] font-medium text-white transition-colors hover:bg-[#229ed9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2aabee]"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
                <path d="M9.8 15.3 9.6 19c.4 0 .6-.2.8-.4l2-1.9 4.1 3c.8.4 1.3.2 1.5-.7l2.7-12.7c.3-1.1-.4-1.6-1.1-1.3L3.7 10.7c-1.1.4-1.1 1-.2 1.3l4.1 1.3 9.5-6c.4-.3.9-.1.6.2" />
              </svg>
              Log in with Telegram
            </a>
          )}

          <p className="mt-8 text-center text-[13px] leading-relaxed text-muted">
            we only see your telegram name and photo.
            <br />
            the bot will message you when someone answers.
          </p>
        </div>
      </main>

      <aside
        className="relative m-3 hidden overflow-hidden rounded-2xl bg-[#fbeef1] lg:flex lg:flex-col lg:justify-end lg:p-12"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.9),transparent_65%),radial-gradient(ellipse_at_85%_95%,rgba(214,69,107,0.22),transparent_60%)]" />

        {/* The wordmark image has wide transparent margins; this box crops to the lettering without editing the file. */}
        <div
          className="absolute top-[30%] left-1/2 w-[74%] -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          style={{ aspectRatio: "1474 / 472" }}
        >
          <Image
            src="/brand/wordmark.png"
            alt=""
            width={2240}
            height={880}
            priority
            className="absolute max-w-none"
            style={{ width: "152%", left: "-35.3%", top: "-32.8%" }}
          />
        </div>

        <div className="relative">
          <p className="font-display text-[34px] leading-[1.15] text-ink">Plan a date they&apos;ll say yes to.</p>
          <p className="mt-3 max-w-sm text-[16px] leading-snug text-ink/65">
            Send a sweet invite, and get your answer straight to Telegram.
          </p>
        </div>
      </aside>
    </div>
  );
}
