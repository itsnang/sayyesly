import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// Small presentational kit for the product UI (login, dashboard, checkout).
// Wrap pages in the `studio` utility so these colours and fonts apply.
// The look is paper and ink: 1.5px ink lines, small square-ish corners and
// hard offset shadows, never pills or soft blurred shadows.

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-[6px] font-medium whitespace-nowrap transition select-none disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose";
const buttonSizes = {
  md: "px-4 py-2.5 text-[14px]",
  sm: "px-3 py-1.5 text-[13px]",
};
const buttonVariants = {
  /** The one main action on a screen: ink, lifts onto a rose shadow */
  primary:
    "border-[1.5px] border-ink bg-ink text-canvas hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--color-rose)] active:translate-0 active:shadow-none",
  secondary:
    "border-[1.5px] border-ink bg-card text-ink hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--color-ink)] active:translate-0 active:shadow-none",
  ghost: "text-muted hover:bg-surface hover:text-ink",
  danger: "border-[1.5px] border-red-700/60 bg-card text-red-700 hover:border-red-700 hover:bg-red-50",
  telegram: "border-[1.5px] border-ink bg-[#2aabee] text-white hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--color-ink)]",
};
export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cx(buttonBase, buttonSizes[size], buttonVariants[variant], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/** A sheet of paper: the container for a block of the product UI. */
export function Sheet({ className, ...props }: ComponentProps<"section">) {
  return <section className={cx("rounded-[8px] border-[1.5px] border-ink bg-card", className)} {...props} />;
}

/** Typewriter label above a group: `01 · the plan`. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("text-[12px] font-semibold tracking-[0.08em] text-muted uppercase", className)}>{children}</p>;
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
  optional,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | undefined;
  children: ReactNode;
  className?: string;
  optional?: boolean;
  /**
   * The id of the control the label names. Set it when the field holds more than
   * that control (buttons, a slider): the whole field is then a <div>, since a
   * click anywhere inside a <label> that misses a button focuses its first input.
   */
  htmlFor?: string;
}) {
  const title = (
    <>
      {label}
      {optional && <span className="text-[12.5px] font-normal text-faint">optional</span>}
    </>
  );
  const titleClass = "mb-1.5 flex items-baseline gap-2 text-[14px] font-medium text-ink";
  const rest = (
    <>
      {children}
      {hint && !error && <span className="mt-1.5 block text-[12.5px] leading-snug text-muted">{hint}</span>}
      {error && <FieldError>{error}</FieldError>}
    </>
  );

  if (htmlFor) {
    return (
      <div className={cx("block", className)}>
        <label htmlFor={htmlFor} className={titleClass}>
          {title}
        </label>
        {rest}
      </div>
    );
  }
  return (
    <label className={cx("block", className)}>
      <span className={titleClass}>{title}</span>
      {rest}
    </label>
  );
}

export function FieldError({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span role="alert" className={cx("mt-1.5 block text-[12.5px] font-medium text-red-700", className)}>
      {children}
    </span>
  );
}

export const inputClass =
  // 16px on phones so iOS doesn't zoom into the field; a little smaller in the desktop editor.
  "w-full rounded-[7px] border border-ink/20 bg-white px-3 py-2 text-[16px] text-ink outline-none transition placeholder:text-faint hover:border-ink/35 focus:border-ink/60 focus:ring-3 focus:ring-rose/15 aria-[invalid=true]:border-red-700 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60 lg:text-[14.5px]";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cx(inputClass, "resize-y leading-relaxed", className)} {...props} />;
}

/** A small square toggle chip (days, times, words): ink when on. */
export function chipClass(on: boolean, className?: string) {
  return cx(
    "rounded-[6px] border transition disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose",
    on ? "border-ink bg-ink text-canvas" : "border-ink/15 bg-white text-ink hover:border-ink/40",
    className,
  );
}

const stampTones = {
  rose: "border-rose-deep text-rose-deep",
  green: "border-emerald-800 text-emerald-800",
  ink: "border-ink text-ink",
  grey: "border-faint text-muted",
  amber: "border-amber-700 text-amber-800",
};

/** A small status badge (e.g. an Invite's Answer). */
export function Stamp({ tone, children, className }: { tone: keyof typeof stampTones; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-px text-[11px] leading-[1.35] font-semibold tracking-[0.06em] uppercase",
        stampTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Page title: the soft display serif, an optional muted tail, and a one-line description. */
export function PageHeading({
  title,
  accent,
  eyebrow,
  description,
  action,
}: {
  title: string;
  accent?: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
      <div className="min-w-0">
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h1 className="font-display text-[clamp(30px,4.4vw,44px)] leading-[1.05] text-ink">
          {title} {accent && <span className="text-muted">{accent}</span>}
        </h1>
        {description && <p className="mt-2 max-w-xl text-[15px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** A tick box for booleans in forms; pass `register(...)` props through. */
export function Checkbox({ label, description, ...props }: ComponentProps<"input"> & { label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="mt-px grid size-5 shrink-0 place-items-center rounded-[5px] border border-ink/40 bg-white text-transparent transition peer-checked:bg-ink peer-checked:text-canvas peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </span>
      <span>
        <span className="block text-[14px] font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{description}</span>}
      </span>
    </label>
  );
}

/** A calm inline message: a notice, a warning, or an error from the server. */
export function Note({ tone = "info", children, className }: { tone?: "info" | "warn" | "error" | "ok"; children: ReactNode; className?: string }) {
  const tones = {
    info: "border-ink/25 bg-surface text-ink",
    warn: "border-amber-700/50 bg-amber-50 text-amber-950",
    error: "border-red-700/50 bg-red-50 text-red-800",
    ok: "border-emerald-800/40 bg-emerald-50 text-emerald-900",
  };
  return (
    <div role={tone === "error" ? "alert" : undefined} className={cx("rounded-[8px] border px-4 py-3 text-[14px] leading-snug", tones[tone], className)}>
      {children}
    </div>
  );
}
