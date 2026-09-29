import Image from "next/image";
import { CtaLocation } from "@/lib/analytics/events";
import { trackClick } from "@/lib/analytics/track";
import { Arrow, Smiley, Sparkle, Star } from "@/components/shared/doodles";
import { NotifCard, PaperButton, PhoneShot, Tape } from "@/components/shared/studio";
import { TornEdge } from "@/components/shared/torn-edge";
import { ScrapbookMotion } from "./scrapbook-motion";

/** A dashed-edge paper card holding a screenshot crop, like a page torn from a planner. */
function PaperCard({ src, alt, position, className }: { src: string; alt: string; position: string; className: string }) {
  return (
    <div data-sb="card" className={`absolute rounded-[3px] border border-dashed border-ink/60 bg-card p-2 shadow-[0_12px_24px_-14px_rgba(60,30,20,0.5)] ${className}`}>
      <div className="relative h-full overflow-hidden rounded-[2px]">
        <Image src={src} alt={alt} fill sizes="200px" className="object-cover" style={{ objectPosition: position }} />
      </div>
    </div>
  );
}

/** The Song on the Invite, as a little "now playing" card: it starts when they open it and loops your part. */
function NowPlaying({ className }: { className: string }) {
  return (
    <div data-sb="song" className={`w-[240px] rounded-[12px] border border-hairline bg-card p-3 text-left shadow-[0_10px_24px_-12px_rgba(60,30,20,0.35)] ${className}`}>
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-ink text-[18px] text-rose">
          ♪
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] tracking-wide text-muted uppercase">now playing</p>
          <p className="truncate text-[13px] font-semibold text-ink">your song · 0:42 – 1:12</p>
        </div>
        <span data-eq="" aria-hidden="true" className="ml-auto flex h-5 items-end gap-[3px]">
          {[0.5, 0.9, 0.6, 1, 0.7].map((h, i) => (
            <span key={i} className="w-[3px] rounded-full bg-rose" style={{ height: `${h * 100}%` }} />
          ))}
        </span>
      </div>
      <p className="mt-2 text-[12px] leading-snug text-muted">Starts the moment they open it, looping the part you picked.</p>
    </div>
  );
}

export function Scrapbook() {
  return (
    <section id="preview" aria-labelledby="scrapbook-title" className="relative mt-24 scroll-mt-24">
      <div className="diary-paper relative">
        <TornEdge position="top" className="text-diary" seed={3} />

        <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-20 sm:px-8 sm:pt-16">
          <h2 id="scrapbook-title" className="mx-auto max-w-md text-center font-mono text-[13.5px] leading-relaxed text-ink">
            What lands on their phone.
            <br />
            And what lands on yours.
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <PaperButton href="/dashboard/invites/new" className="whitespace-nowrap" {...trackClick("make_invite_clicked", { location: CtaLocation.Scrapbook })}>Make an invite</PaperButton>
            <PaperButton href="/demo" className="whitespace-nowrap">Try the demo ▷</PaperButton>
          </div>

          {/* The collage */}
          <ScrapbookMotion>
          <div className="relative mx-auto mt-12 h-[820px] max-w-[980px] lg:h-[640px]">
            <PaperCard
              src="/landing/envelope-card.png"
              alt="the envelope, with the question on the card inside"
              position="50% 30%"
              className="bottom-6 left-[calc(50%-235px)] h-[250px] w-[190px] -rotate-[7deg] max-lg:hidden"
            />
            <PaperCard
              src="/landing/envelope-yes.png"
              alt="their answer: see ya there!"
              position="50% 30%"
              className="right-[calc(50%-240px)] bottom-2 h-[250px] w-[190px] rotate-[6deg] max-lg:hidden"
            />
            <Tape data-sb="tape" className="bottom-[252px] left-[calc(50%-200px)] -rotate-[20deg] max-lg:hidden" />
            <Tape data-sb="tape" className="right-[calc(50%-210px)] bottom-[244px] rotate-[18deg] max-lg:hidden" />

            <PhoneShot
              data-sb="phone"
              src="/landing/envelope-letter.png"
              alt="an Envelope invite, opened into a handwritten letter: will you have dinner with me?"
              position="50% 0%"
              priority
              sizes="260px"
              className="absolute top-0 left-1/2 w-[250px] -translate-x-1/2 sm:w-[270px]"
            />

            {/* Messages the bot really sends, floating around the phone */}
            <NotifCard data-sb="notif" title="🎉 Sreyneang said YES!" time="now" className="absolute top-[6%] left-0 -rotate-2 max-lg:hidden">
              Saturday, September 26 · 7:30 PM
              <br />
              💬 “can’t wait :)”
            </NotifCard>
            <NotifCard data-sb="notif" title="💌 Dara said maybe another time." time="2d ago" className="absolute top-[4%] right-0 rotate-2 max-lg:hidden">
              Not a no, just not now. Be kind to yourself 🌷
            </NotifCard>
            <NowPlaying className="absolute top-[31%] left-[3%] rotate-1 max-lg:hidden" />
            <NotifCard data-sb="notif" title="Linked ✓" time="18:15" className="absolute top-[36%] right-[5%] -rotate-1 max-lg:hidden">
              This group will hear the moment Sreyneang answers 💌
            </NotifCard>

            {/* On phones: the Song and two messages under the phone instead of around it */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 lg:hidden">
              <NowPlaying className="rotate-1" />
              <NotifCard data-sb="notif" title="🎉 Sreyneang said YES!" className="-rotate-1">
                Saturday, September 26 · 7:30 PM
              </NotifCard>
              <NotifCard data-sb="notif" title="💌 Dara said maybe another time." time="2d ago" className="rotate-1">
                Not a no, just not now. Be kind to yourself 🌷
              </NotifCard>
            </div>

            <Smiley data-sb="doodle" className="absolute top-[2%] left-[28%] size-11 -rotate-12 max-sm:left-[4%]" />
            <Smiley data-sb="doodle" className="absolute top-[62%] right-[22%] size-9 rotate-12 max-lg:hidden" />
            <Star data-sb="doodle" className="absolute top-[22%] left-[31%] size-6 fill-sun text-ink max-sm:hidden" />
            <Star data-sb="doodle" className="absolute top-[14%] right-[27%] size-5 fill-sun text-ink max-sm:right-[6%] max-sm:top-[4%]" />
            <Sparkle data-sb="doodle" className="absolute top-[70%] left-[24%] size-6 text-ink max-lg:hidden" />
            <div data-sb="note" className="absolute top-[58%] left-[4%] max-lg:hidden">
              <p className="w-32 font-mono text-[12px] leading-snug text-ink">they open your link on their phone</p>
              <Arrow className="mt-1 ml-10 w-20 text-ink" />
            </div>
          </div>
          </ScrapbookMotion>
        </div>

        <TornEdge position="bottom" className="text-diary" seed={7} />
      </div>

    </section>
  );
}
