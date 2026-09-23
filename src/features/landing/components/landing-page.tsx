import Image from "next/image";
import Link from "next/link";

const STEPS = [
  { title: "write your question", body: "Pick a theme, add the plan and a few times that work for you." },
  { title: "send the link", body: "They get a playful page where the “no” button runs away." },
  { title: "hear it on Telegram", body: "The answer lands in your DMs (and your group chat, if you like)." },
];

export function LandingPage({ exampleHref }: { exampleHref: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-4 py-12 text-center sm:py-16">
      <Image
        src="/pasted-1780506636030-0.png"
        alt="a kitten holding a hello kitty bouquet"
        width={220}
        height={220}
        priority
        className="h-auto w-[min(220px,60vw)] animate-[float_4s_ease-in-out_infinite]"
      />
      <h1 className="mt-2 font-[family-name:var(--hand)] text-[clamp(40px,9vw,68px)] font-bold leading-[1.05] text-[var(--ink)]">
        ask them out,{" "}
        <span className="text-[var(--accent)]">the cute way</span>
      </h1>
      <p className="mt-4 max-w-md text-[17px] text-[var(--ink-soft)]">
        One question, two buttons, and one of them runs away. Make a date invite in a minute and get the answer on
        Telegram.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard/invites/new"
          className="rounded-xl bg-[var(--accent)] px-6 py-3 text-[17px] text-white shadow-[3px_4px_0_rgba(138,45,92,0.22)] hover:brightness-105"
        >
          make your invite ✦
        </Link>
        <Link
          href={exampleHref}
          className="rounded-xl border-2 border-[var(--line)] bg-[var(--paper)] px-6 py-3 text-[17px] text-[var(--ink)] hover:bg-[var(--paper-2)]"
        >
          see an example
        </Link>
      </div>

      <ol className="mt-14 grid w-full gap-4 text-left sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="rounded-2xl border-2 border-[var(--line)]/40 bg-[var(--paper)] p-4">
            <span className="font-[family-name:var(--hand)] text-3xl text-[var(--accent)]">{i + 1}.</span>
            <p className="mt-1 text-[16px] text-[var(--ink)]">{step.title}</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{step.body}</p>
          </li>
        ))}
      </ol>

      <p className="mt-12 text-sm text-[var(--ink-faint)]">
        already have invites? <Link href="/dashboard" className="underline">open your dashboard</Link>
      </p>
      <style>{`@keyframes float { 0%,100% { transform: translateY(0) rotate(-.4deg) } 50% { transform: translateY(-9px) rotate(.4deg) } }`}</style>
    </main>
  );
}
