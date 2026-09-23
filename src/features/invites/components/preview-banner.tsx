import Link from "next/link";

/** Tells the Creator they're looking at their own Invite and nothing they do is recorded. */
export function PreviewBanner() {
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-[#231b17] px-4 py-2 text-center font-[family-name:var(--font-instrument-sans)] text-[13px] text-[#fbf6ef]"
    >
      <span>Preview · this is your own invite, so nothing you tap is saved.</span>
      <Link href="/dashboard" className="underline underline-offset-4">
        Back to dashboard
      </Link>
    </div>
  );
}
