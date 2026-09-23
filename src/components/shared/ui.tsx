import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// Small presentational kit for the dashboard, in the soft-pink paper style.
// Colours come from the CSS variables in globals.css.

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[15px] transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";
const buttonVariants = {
  primary: "bg-[var(--accent)] text-white shadow-[3px_4px_0_rgba(138,45,92,0.22)] hover:brightness-105",
  secondary: "border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]",
  ghost: "text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)]",
  danger: "border-2 border-red-700/60 bg-[var(--paper)] text-red-800 hover:bg-red-50",
};
export type ButtonVariant = keyof typeof buttonVariants;

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={cx(buttonBase, buttonVariants[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={cx(buttonBase, buttonVariants[variant], className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cx(
        "rounded-2xl border-2 border-[var(--line)]/70 bg-[var(--paper)] p-4 shadow-[4px_5px_0_rgba(138,45,92,0.12)] sm:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | undefined;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1 block text-sm text-[var(--ink)]">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-[var(--ink-soft)]">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border-2 border-[var(--line)]/50 bg-white/70 px-3 py-2 text-[16px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] disabled:opacity-60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cx(inputClass, "resize-y leading-relaxed", className)} {...props} />;
}

export function Badge({ tone, children }: { tone: "pink" | "green" | "grey" | "amber"; children: ReactNode }) {
  const tones = {
    pink: "bg-[var(--paper-2)] text-[var(--accent)]",
    green: "bg-emerald-50 text-emerald-800",
    grey: "bg-stone-100 text-stone-600",
    amber: "bg-amber-50 text-amber-800",
  };
  return <span className={cx("inline-block rounded-full px-2.5 py-0.5 text-xs", tones[tone])}>{children}</span>;
}

export function PageHeading({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="mb-5">
      <h1 className="font-[family-name:var(--hand)] text-4xl font-bold text-[var(--ink)]">{title}</h1>
      {description && <p className="mt-1 text-sm text-[var(--ink-soft)]">{description}</p>}
    </div>
  );
}
