import Link from "next/link";

const ERRORS: Record<string, string> = {
  expired: "That login took too long or was opened in another browser. Please try again.",
  failed: "Telegram couldn't log you in. Please try again.",
};

/** "Log in with Telegram": the only way in. */
export function LoginScreen({ next, error }: { next: string; error: string | null }) {
  const href = `/api/auth/telegram?next=${encodeURIComponent(next)}`;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border-2 border-[var(--line)]/70 bg-[var(--paper)] p-6 text-center shadow-[4px_5px_0_rgba(138,45,92,0.12)]">
        <h1 className="font-[family-name:var(--hand)] text-5xl font-bold text-[var(--ink)]">hi there 💌</h1>
        <p className="mt-3 text-[15px] text-[var(--ink-soft)]">
          Log in to make an invite and hear the answer on Telegram.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {ERRORS[error] ?? ERRORS.failed}
          </p>
        )}
        <a
          href={href}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 py-3 text-[16px] text-white shadow-[3px_4px_0_rgba(0,0,0,0.12)] hover:brightness-105"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
            <path d="M9.8 15.3 9.6 19c.4 0 .6-.2.8-.4l2-1.9 4.1 3c.8.4 1.3.2 1.5-.7l2.7-12.7c.3-1.1-.4-1.6-1.1-1.3L3.7 10.7c-1.1.4-1.1 1-.2 1.3l4.1 1.3 9.5-6c.4-.3.9-.1.6.2" />
          </svg>
          Log in with Telegram
        </a>
        <p className="mt-4 text-xs text-[var(--ink-faint)]">
          We only see your Telegram name and photo. <Link href="/" className="underline">Back home</Link>
        </p>
      </div>
    </main>
  );
}
