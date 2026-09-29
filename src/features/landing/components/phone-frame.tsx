import Image from "next/image";
import { Iphone15Pro } from "@/components/shared/mockups/iphone-15-pro";
import { cx } from "@/components/shared/ui";

const pct = (n: number, of: number) => `${(n / of) * 100}%`;

/**
 * A screenshot of an invite in the same iPhone frame the studio's live preview
 * uses, so the landing shows exactly what a Creator sees. Size it with `className`.
 * `beforeSrc` stacks a second screenshot on top, hidden, for an animation to
 * show first and then fade into `src` (the studio's demo reel).
 */
export function PhoneFrame({
  src,
  alt,
  className,
  sizes = "280px",
  priority = false,
  beforeSrc,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  beforeSrc?: string;
}) {
  return (
    <div className={cx("relative aspect-[433/882] drop-shadow-[0_22px_26px_rgba(60,30,20,0.18)]", className)}>
      <Iphone15Pro aria-hidden className="absolute inset-0 size-full" />
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          left: pct(21.25, 433),
          top: pct(19.25, 882),
          width: pct(389.5, 433),
          height: pct(843.5, 882),
          borderRadius: `${pct(55.75, 389.5)} / ${pct(55.75, 843.5)}`,
        }}
      >
        {/* The screenshots are 390 × 780; the screen is a little taller, so crop from the top. */}
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />
        {beforeSrc && <Image data-screen-before="" src={beforeSrc} alt="" fill sizes={sizes} className="object-cover object-top opacity-0" />}
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-full bg-black"
        style={{ left: pct(154, 433), top: pct(30, 882), width: pct(124, 433), height: pct(37, 882) }}
      />
    </div>
  );
}
