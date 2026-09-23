import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Heart } from "./doodles";

// Building blocks of the product pages: warm paper, a soft serif, typewriter
// notes and ink doodles (landing, login, dashboard).

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function ArrowIcon({ className, direction = "right" }: { className?: string; direction?: "right" | "left" | "down" }) {
  const rotate = direction === "left" ? "rotate-180" : direction === "down" ? "rotate-90" : "";
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={cx("size-3.5", rotate, className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

/** The dark ink pill, the main call to action. */
export function InkButton({ href, children, className, ...rest }: Omit<ComponentProps<typeof Link>, "href"> & { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-canvas transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_-2px_var(--color-rose)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** Outlined typewriter button, the scrapbook's secondary action. */
export function PaperButton({ href, children, className, ...rest }: Omit<ComponentProps<typeof Link>, "href"> & { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center gap-2 rounded-[4px] border-[1.5px] border-ink bg-card/70 px-4 py-2 font-mono text-[13px] tracking-[0.06em] text-ink uppercase transition hover:bg-ink hover:text-canvas",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** The italic serif word inside a headline. */
export function Accent({ children, className }: { children: ReactNode; className?: string }) {
  return <em className={cx("font-serif italic", className)}>{children}</em>;
}

/** A product screenshot in a light phone bezel, so it reads as "what they'll see". */
export function PhoneShot({
  src,
  alt,
  position = "top",
  className,
  sizes = "280px",
  priority,
}: {
  src: string;
  alt: string;
  position?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cx(
        "relative block aspect-[390/800] rounded-[34px] border-[1.5px] border-ink bg-card p-[7px] shadow-[0_22px_40px_-20px_rgba(60,30,20,0.45)]",
        className,
      )}
    >
      <span className="relative block h-full overflow-hidden rounded-[27px] bg-surface">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority ?? false} draggable={false} className="object-cover" style={{ objectPosition: position }} />
      </span>
    </span>
  );
}

/** A lock-screen style notification, as the bot's messages arrive. */
export function NotifCard({ title, children, time = "now", className }: { title: ReactNode; children?: ReactNode; time?: string; className?: string }) {
  return (
    <div className={cx("w-[250px] rounded-[12px] border border-hairline bg-card p-3 text-left shadow-[0_10px_24px_-12px_rgba(60,30,20,0.35)]", className)}>
      <div className="flex items-center gap-1.5 text-[10.5px] text-muted">
        <span className="grid size-4 place-items-center rounded-[4px] bg-ink text-rose">
          <Heart className="size-2.5" strokeWidth={3} />
        </span>
        <span className="font-mono tracking-wide uppercase">Ask her out</span>
        <span className="ml-auto">{time}</span>
      </div>
      <p className="mt-1.5 text-[13px] leading-snug font-semibold text-ink">{title}</p>
      {children && <div className="mt-0.5 text-[12.5px] leading-snug text-muted">{children}</div>}
    </div>
  );
}

/** A strip of washi tape holding things to the page. */
export function Tape({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cx("absolute h-6 w-20 bg-[#f4e3a8]/75 shadow-sm backdrop-blur-[1px]", className)} />;
}

/** The wordmark: serif italic with a small ink heart. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 font-serif text-[22px] leading-none text-ink italic", className)}>
      ask her out
      <Heart className="size-3.5 text-rose" strokeWidth={2.4} />
    </span>
  );
}
