import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// Small presentational kit for the product UI (login, dashboard) in the studio style.
// Wrap pages in the `studio` utility so these colours and fonts apply.

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose";
const buttonVariants = {
  primary: "bg-ink text-white hover:bg-black",
  secondary: "border border-hairline bg-card text-ink hover:border-ink",
  ghost: "text-muted hover:bg-surface hover:text-ink",
  danger: "border border-red-200 bg-card text-red-700 hover:border-red-600 hover:bg-red-50",
  rose: "bg-rose text-white hover:bg-rose-deep",
};
export type ButtonVariant = keyof typeof buttonVariants;

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button type={type} className={cx(buttonBase, buttonVariants[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={cx(buttonBase, buttonVariants[variant], className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cx("rounded-[20px] border border-ink/12 bg-card p-5 sm:p-6", className)} {...props} />;
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
  optional,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | undefined;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 flex items-baseline gap-2 text-[13px] font-medium text-ink">
        {label}
        {optional && <span className="text-[12px] font-normal text-faint">optional</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-[12.5px] leading-snug text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1.5 block text-[12.5px] text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-hairline bg-surface px-3.5 py-3 text-[16px] text-ink outline-none transition placeholder:text-faint focus:border-ink focus:bg-card disabled:cursor-not-allowed disabled:opacity-55";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cx(inputClass, "resize-y leading-relaxed", className)} {...props} />;
}

export function Badge({ tone, children }: { tone: "rose" | "green" | "grey" | "amber" | "ink"; children: ReactNode }) {
  const tones = {
    rose: "bg-rose-soft text-rose-deep",
    green: "bg-emerald-50 text-emerald-800",
    grey: "bg-surface text-muted",
    amber: "bg-amber-50 text-amber-800",
    ink: "bg-ink text-white",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] uppercase", tones[tone])}>
      {children}
    </span>
  );
}

/** Page title in the editorial style: sans with one italic serif word. */
export function PageHeading({
  title,
  accent,
  description,
  action,
}: {
  title: string;
  accent?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
      <div>
        <h1 className="font-display text-[clamp(30px,4.4vw,44px)] leading-[1.05] text-ink">
          {title} {accent && <span className="text-muted">{accent}</span>}
        </h1>
        {description && <p className="mt-2 max-w-xl text-[15px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** A switch for booleans in forms; pass `register(...)` props through. */
export function Switch({ label, description, ...props }: ComponentProps<"input"> & { label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-hairline bg-surface p-4 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
      <span>
        <span className="block text-[14px] font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[12.5px] text-muted">{description}</span>}
      </span>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-6 w-10 shrink-0 rounded-full bg-hairline transition-colors peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
      />
    </label>
  );
}
