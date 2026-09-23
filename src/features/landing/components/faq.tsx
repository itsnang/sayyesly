const QUESTIONS = [
  {
    q: "Can they actually say no?",
    a: "Not with the “no” button, that's the joke. After five tries a small, still “maybe another time?” link appears and records a gentle maybe-later. You get a kind message either way, and they never feel cornered.",
  },
  {
    q: "Do they need an account or the app?",
    a: "No. They just open the link in any browser; most people tap it straight from Telegram. Only you log in, with your Telegram account.",
  },
  {
    q: "What if none of my times work for them?",
    a: "Turn on “let them suggest a time” and they get a calendar and a time picker. Times always show in your invite's time zone, so nobody turns up an hour early.",
  },
  {
    q: "Who sees the link preview?",
    a: "Anyone the link is forwarded to sees your question in the preview, never their name. Invites aren't listed on search engines.",
  },
  {
    q: "How do paid themes work?",
    a: "You pay once per theme with any Cambodian banking app that scans KHQR. It unlocks as soon as the payment is confirmed, and it's yours for every invite after that.",
  },
  {
    q: "Can I change the plan after they say yes?",
    a: "Yes. Place, map link, dress code, notes and photos stay editable. The question, the times and the theme lock once they've answered, since that's what they said yes to.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto mt-24 max-w-3xl scroll-mt-24 px-5 sm:px-8">
      <h2 id="faq-title" className="text-center font-display text-[clamp(28px,3.6vw,40px)] text-ink">
        Things people ask
      </h2>
      <div className="mt-10 border-t-[1.5px] border-ink">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q} className="group border-b border-ink/15">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16.5px] text-ink [&::-webkit-details-marker]:hidden">
              {q}
              <span aria-hidden="true" className="font-mono text-[20px] leading-none text-ink transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="max-w-[62ch] pb-6 text-[15px] leading-relaxed text-muted">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
