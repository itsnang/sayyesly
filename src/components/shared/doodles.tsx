import type { SVGProps } from "react";

// Hand-drawn ink doodles for the product pages. Line art uses currentColor;
// blobs take a fill colour. Paths are drawn slightly uneven on purpose.

type DoodleProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & { className?: string };

function Ink({ children, viewBox, ...rest }: DoodleProps & { viewBox: string }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function Heart(props: DoodleProps) {
  return (
    <Ink viewBox="0 0 32 30" {...props}>
      <path d="M16.2 27.5c-1.9-1.5-10.6-7.4-12.6-12.8C1.9 10.1 4.2 4.4 9.3 4.1c3.3-.2 5.4 2.3 6.6 4.6 1.3-2.6 3.6-5.2 7-4.8 5 .6 6.9 6.3 5 10.8-2.3 5.5-9.9 11.2-11.7 12.8z" />
    </Ink>
  );
}

export function Sparkle(props: DoodleProps) {
  return (
    <Ink viewBox="0 0 32 32" {...props}>
      <path d="M16.1 2.6c.6 6.8 3.2 10.6 13 13.1-9.3 1.7-12.2 5.4-13.2 14-1.2-8.3-4.3-12.1-13.1-13.6 8.9-2 12.2-5.8 13.3-13.5z" />
    </Ink>
  );
}

export function Star(props: DoodleProps) {
  return (
    <Ink viewBox="0 0 34 32" {...props}>
      <path d="M17.2 2.8l3.9 9.4 10 .6-7.8 6.5 2.6 9.8-8.7-5.6-8.5 5.8 2.4-9.9L3.4 13l10.1-.9z" />
    </Ink>
  );
}

export function Squiggle(props: DoodleProps) {
  return (
    <Ink viewBox="0 0 64 20" {...props}>
      <path d="M2.5 11.5c4.2-7.4 8.4-7.6 11.6-.4 3 6.9 7.5 7.1 11.2.2 3.6-6.8 8.3-7 11.5-.2 3.3 7 7.8 7.4 11.6.6 3.3-6 7.3-6.9 12.6-1.9" />
    </Ink>
  );
}

export function Loop(props: DoodleProps) {
  return (
    <Ink viewBox="0 0 72 36" {...props}>
      <path d="M2.6 30.4C9.1 13.6 21.8 4.7 31 8.2c7.3 2.8 4.9 14.3-2.7 13.9-7.4-.4-4.8-12.6 5.3-16.1 11.1-3.9 25.1 3.1 36.1 19.4" />
    </Ink>
  );
}

export function Spiral(props: DoodleProps) {
  return (
    <Ink viewBox="0 0 36 36" {...props}>
      <path d="M18.4 17.6c1.4-1.6-.6-3.7-2.4-2.8-2.6 1.3-1.8 5.6 1.3 6 4.3.6 6.5-4.6 3.9-8-3.4-4.5-10.9-3-12.1 2.7-1.4 6.6 5.1 11.5 11.4 9.5 6.9-2.2 8.5-11.3 3.8-16.3" />
    </Ink>
  );
}

export function Arrow(props: DoodleProps) {
  return (
    <Ink viewBox="0 0 70 44" {...props}>
      <path d="M3.4 38.6C13.9 17.4 34.1 6.3 60.8 9.4" />
      <path d="M51.6 2.8l9.6 6.6-7.9 8.4" />
    </Ink>
  );
}

export function Envelope(props: DoodleProps) {
  return (
    <Ink viewBox="0 0 48 36" {...props}>
      <path d="M4.2 7.4c13.2-.9 26.6-.8 39.9-.2.7 7.4.6 15.1-.2 22.6-13 .9-26.3 1-39.6.2-.9-7.5-.9-15.1-.1-22.6z" />
      <path d="M4.6 8.2c6.1 5.5 12.2 9.6 19.2 12.7 6.9-3.3 13-7.5 19.6-12.9" />
      <path d="M24.1 17.2c-.8-.7-3.6-2.5-3.5-4.3.1-1.6 2.2-2 3.4-.4 1.1-1.6 3.4-1.2 3.5.4.1 1.8-2.6 3.6-3.4 4.3z" fill="currentColor" />
    </Ink>
  );
}

/** A little cat sitting with its tail curled, in one ink line. */
export function Cat(props: DoodleProps) {
  return (
    <Ink viewBox="0 0 110 86" {...props}>
      <path d="M31.8 39.4c-2.6-8.2-1.9-15.9 1.3-22.4l6.8 7.5c4.6-1.6 10.5-1.7 15.6-.2l6.3-7.9c3.4 6.3 3.9 14.2 1.5 21.6" />
      <path d="M31.8 39.4c-5.6 7.3-8.9 17.5-8.3 26.4.5 8.3 5.7 13 13.7 13.3 8.9.4 18.5.4 27.2-.3 7.9-.6 11.3-6.5 10.2-14.3-1.2-8.9-5.4-17.6-11.3-24.3" />
      <path d="M74.4 70.8c9.2 2.6 20.6.9 23.7-6.8 2.3-5.8-2.4-11.3-7.5-8.6-3.5 1.9-2.9 6.3.4 6.6" />
      <path d="M39.2 36.2c1.2 1.4 3 1.4 4.2 0M52.2 36.1c1.2 1.4 3 1.4 4.2 0" />
      <path d="M47 41.2l1.9 1.5 1.9-1.5" />
      <path d="M36.4 79c-.3-4.2 1.2-7.4 4.3-8.6M57.6 79.1c.4-4.1-.9-7.3-3.8-8.7" />
    </Ink>
  );
}

/** A drawn smiley sticker (the CHANI-style yellow face, in ink). */
export function Smiley({ className, ...props }: DoodleProps) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" className={className} {...props}>
      <path
        d="M22.3 3.4c10.6-.3 18.4 8.1 18.2 18.8-.2 10.3-8.5 18.2-18.8 18.3C11.2 40.6 3.3 32.3 3.5 21.8 3.7 11.5 11.8 3.7 22.3 3.4z"
        fill="var(--color-sun)"
        stroke="var(--color-ink)"
        strokeWidth="1.7"
      />
      <path d="M15.4 16.6v3.4M28.4 16.4v3.4" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M13.2 25.6c4.6 5.8 12.9 6 17.8-.2" fill="none" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type BlobProps = DoodleProps & { fill: string };

/** Coloured, ink-outlined shapes (cloud, leaf, petal, flower) in the Belle style. */
export function Cloud({ fill, ...props }: BlobProps) {
  return (
    <Ink viewBox="0 0 46 30" {...props}>
      <path
        d="M10.4 26.4C4.6 26.8 2.2 20.3 6.6 17.1c-1.4-5.6 4.9-9.6 9.3-6.4 1.9-6.6 11.1-8.4 14.8-2.3 5.6-2.3 11.1 2.5 9.3 8.1 5.1 1.3 4.6 9.4-1.4 9.8-9.4.8-18.9.8-28.2.1z"
        fill={fill}
      />
    </Ink>
  );
}

export function Leaf({ fill, ...props }: BlobProps) {
  return (
    <Ink viewBox="0 0 34 34" {...props}>
      <path d="M4.2 30.1C3.4 16.6 12.8 5 30.1 3.6c1.6 15.9-8.7 26.6-25.9 26.5z" fill={fill} />
      <path d="M5.3 29c6.1-7.4 12.9-13.8 20.9-19.4" />
    </Ink>
  );
}

export function Petal({ fill, ...props }: BlobProps) {
  return (
    <Ink viewBox="0 0 30 36" {...props}>
      <path d="M15.3 33.2C6.4 28.6 1.9 19.7 4.3 11.1 6 5.1 11.3 2.5 15.2 6.3c3.7-4.2 9.8-2.2 11.2 4 2 8.6-2.3 17.9-11.1 22.9z" fill={fill} />
    </Ink>
  );
}

export function Flower({ fill, ...props }: BlobProps) {
  return (
    <Ink viewBox="0 0 40 40" {...props}>
      <path
        d="M20.2 17.2c-3.6-4.7-2.6-12.3 1.9-12.5 4.8-.2 5.2 7.6 1.2 11.6 4.9-3.4 12.2-2.1 12.1 2.5-.1 4.6-7.9 5-11.7 1.3 3.6 4.6 2.7 12.1-1.9 12.4-4.8.3-5.2-7.6-1.2-11.4-4.9 3.4-12.2 2-12.1-2.6.1-4.6 7.8-5 11.7-1.3z"
        fill={fill}
      />
      <circle cx="21.1" cy="18.9" r="2.4" fill="currentColor" />
    </Ink>
  );
}
