const QUESTIONS = [
  {
    q: "Can they say no?",
    a: "Every Theme has a gentle way out: \"maybe another time\" in Kitten Soft, \"i can't make it this time\" in Envelope. You get a kind message either way, and they never feel cornered.",
  },
  {
    q: "Do they need an account or the app?",
    a: "No. They just open the link in any browser; most people tap it straight from Telegram. Only you log in, with your Telegram account.",
  },
  {
    q: "Do I need Telegram?",
    a: "Yes. You log in with your Telegram account, and that's where answers reach you: the sayyesly bot messages you, or a group chat you've linked. The person you invite doesn't need Telegram, just the link.",
  },
  {
    q: "What if their answer doesn't reach me on Telegram?",
    a: "If you didn't let the bot message you when you logged in, open it in Telegram and press Start once. The Share screen warns you before you send a link that has nowhere to deliver the answer. And every answer shows in your list of invites too, so nothing gets lost.",
  },
  {
    q: "Can I invite a group, or only one person?",
    a: "One invite is for one person and takes one answer, the first one sent. To ask several people, make one invite each; Duplicate copies an invite in a tap. You can still link a group chat so your friends hear the answer as it comes in.",
  },
  {
    q: "What if none of my times work for them?",
    a: "Choose \"Let them pick\" when you make it. They get a calendar, a few times around the part of the day you chose, and a box for any other time. Times always show in your invite's time zone, so nobody turns up an hour early.",
  },
  {
    q: "Who sees the link preview?",
    a: "Anyone the link is forwarded to sees your question in the preview, never their name. Invites aren't listed on search engines.",
  },
  {
    q: "How do paid Themes work?",
    a: "You pay once per Theme with any banking app that scans KHQR. It unlocks as soon as the payment is confirmed, and it's yours for every invite after that.",
  },
  {
    q: "Can I change the plan after they say yes?",
    a: "Yes. Place, map link, dress code, notes and photos stay editable. The question, the times and the Theme lock once they've answered, since that's what they said yes to.",
  },
  {
    q: "Can I delete an invite?",
    a: "Yes, from the invite's page in your dashboard. It's deleted for good, with its answer and linked groups, and the link stops working.",
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
