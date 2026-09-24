import Image from "next/image";
import { Arrow, Smiley, Sparkle, Star } from "@/components/shared/doodles";
import { NotifCard, PaperButton, PhoneShot, Tape } from "@/components/shared/studio";
import { TornEdge } from "@/components/shared/torn-edge";

/** A dashed-edge paper card holding a screenshot crop, like a page torn from a planner. */
function PaperCard({ src, alt, position, className }: { src: string; alt: string; position: string; className: string }) {
  return (
    <div className={`absolute rounded-[3px] border border-dashed border-ink/60 bg-card p-2 shadow-[0_12px_24px_-14px_rgba(60,30,20,0.5)] ${className}`}>
      <div className="relative h-full overflow-hidden rounded-[2px]">
        <Image src={src} alt={alt} fill sizes="200px" className="object-cover" style={{ objectPosition: position }} />
      </div>
    </div>
  );
}

export function Scrapbook() {
  return (
    <section id="how" aria-labelledby="scrapbook-title" className="relative mt-24 scroll-mt-24">
      <div className="grid-paper relative">
        <TornEdge position="top" className="text-grid-pink" seed={3} />

        <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-20 sm:px-8 sm:pt-16">
          <h2 id="scrapbook-title" className="mx-auto max-w-md text-center font-mono text-[13.5px] leading-relaxed text-ink">
            One link. One question. One very shy &quot;no&quot; button.
            <br />
            And the answer, straight to your phone.
          </h2>
          <div className="mt-5 flex justify-center gap-3">
            <PaperButton href="/dashboard/invites/new">Make an invite</PaperButton>
            <PaperButton href="/demo">Try the demo ▷</PaperButton>
          </div>

          {/* The collage */}
          <div className="relative mx-auto mt-12 h-[720px] max-w-[980px] lg:h-[640px]">
            <PaperCard
              src="/landing/step-plan.png"
              alt="the date plan with restaurant photos"
              position="50% 0%"
              className="bottom-6 left-[calc(50%-235px)] h-[250px] w-[190px] -rotate-[7deg] max-sm:hidden"
            />
            <PaperCard
              src="/landing/step-done.png"
              alt="see you then, with confetti"
              position="50% 40%"
              className="right-[calc(50%-240px)] bottom-2 h-[250px] w-[190px] rotate-[6deg] max-sm:hidden"
            />
            <Tape className="bottom-[252px] left-[calc(50%-200px)] -rotate-[20deg] max-sm:hidden" />
            <Tape className="right-[calc(50%-210px)] bottom-[244px] rotate-[18deg] max-sm:hidden" />

            <PhoneShot
              src="/landing/step-ask.png"
              alt="the invite: will you have dinner with me?"
              position="50% 40%"
              priority
              sizes="260px"
              className="absolute top-0 left-1/2 w-[250px] -translate-x-1/2 sm:w-[270px]"
            />

            {/* Messages the bot really sends, floating around the phone */}
            <NotifCard title="🎉 Sreyneang said YES!" time="now" className="absolute top-[6%] left-0 -rotate-2 max-lg:hidden">
              Saturday, September 26 · 7:30 PM
              <br />
              📍 mauu steak
            </NotifCard>
            <NotifCard title="(Sreyneang tried No 6 times 😂)" time="now" className="absolute top-[34%] left-[6%] rotate-1 max-lg:hidden" />
            <NotifCard title="💌 Dara said maybe another time." time="2d ago" className="absolute top-[4%] right-0 rotate-2 max-lg:hidden">
              Not a no, just not now. Be kind to yourself 🌷
            </NotifCard>
            <NotifCard title="Linked ✓" time="18:15" className="absolute top-[36%] right-[5%] -rotate-1 max-lg:hidden">
              This group will hear the moment Sreyneang answers 💌
            </NotifCard>

            {/* On phones: two messages under the phone instead of around it */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 lg:hidden">
              <NotifCard title="🎉 Sreyneang said YES!" className="-rotate-1">
                Saturday, September 26 · 7:30 PM · mauu steak
              </NotifCard>
              <NotifCard title="(Sreyneang tried No 6 times 😂)" className="rotate-1" />
            </div>

            <Smiley className="absolute top-[2%] left-[28%] size-11 -rotate-12 max-sm:left-[4%]" />
            <Smiley className="absolute top-[62%] right-[22%] size-9 rotate-12 max-lg:hidden" />
            <Star className="absolute top-[22%] left-[31%] size-6 fill-sun text-ink max-sm:hidden" />
            <Star className="absolute top-[14%] right-[27%] size-5 fill-sun text-ink max-sm:right-[6%] max-sm:top-[4%]" />
            <Sparkle className="absolute top-[70%] left-[24%] size-6 text-ink max-lg:hidden" />
            <div className="absolute top-[58%] left-[4%] max-lg:hidden">
              <p className="w-32 font-mono text-[12px] leading-snug text-ink">they open your link on their phone</p>
              <Arrow className="mt-1 ml-10 w-20 text-ink" />
            </div>
          </div>
        </div>

        <TornEdge position="bottom" className="text-grid-pink" seed={7} />
      </div>

      <p className="mt-16 text-center text-[20px] text-ink sm:text-[22px]">Say it nicely. Hear it instantly.</p>
    </section>
  );
}
