"use client";

import { FieldError, inputClass } from "@/components/shared/ui";

const TEMPLATES = [
  "will you have *dinner* with me?",
  "coffee this *weekend*?",
  "can I take you *out* on Friday?",
  "want to see a *movie* with me?",
  "*picnic* by the river on Sunday?",
];

const plain = (markup: string) => markup.replace(/\*/g, "");
const emphasised = (markup: string) => /\*([^*]+)\*/.exec(markup)?.[1] ?? null;
const core = (token: string) => token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

/** Wraps the core of the i-th word (keeping its punctuation outside) in *stars*. */
function withEmphasis(text: string, index: number | null): string {
  // Split keeping the whitespace, so typing a space isn't swallowed.
  let word = -1;
  return text
    .split(/(\s+)/)
    .map((part) => {
      if (!part || /^\s+$/.test(part)) return part;
      word++;
      if (word !== index) return part;
      const c = core(part);
      return c ? part.replace(c, `*${c}*`) : part;
    })
    .join("");
}

type QuestionFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (markup: string) => void;
  disabled?: boolean;
  error?: string | undefined;
};

/**
 * The question as plain text, plus "tap a word to underline it". Stores the
 * `*word*` markup the themes understand, so nobody has to type asterisks.
 */
export function QuestionField({ label, placeholder, value, onChange, disabled, error }: QuestionFieldProps) {
  const text = plain(value);
  const current = emphasised(value);
  const words = text.split(/\s+/).filter(Boolean);
  const selectedIndex = current === null ? -1 : words.findIndex((w) => core(w) === current);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor="question" className="text-[13.5px] font-medium text-ink">
          {label}
        </label>
        {!disabled && (
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[13px] text-muted hover:bg-surface hover:text-ink [&::-webkit-details-marker]:hidden">
              Examples
              <svg viewBox="0 0 16 16" aria-hidden className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </summary>
            <div className="absolute top-full right-0 z-30 mt-1 w-64 rounded-[8px] border border-ink/12 bg-white p-1 shadow-[0_12px_32px_-12px_rgba(35,27,23,0.35)]">
              {TEMPLATES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={(e) => {
                    onChange(t);
                    e.currentTarget.closest("details")?.removeAttribute("open");
                  }}
                  className="block w-full rounded-[6px] px-2.5 py-2 text-left text-[14px] text-ink hover:bg-surface"
                >
                  {plain(t)}
                </button>
              ))}
            </div>
          </details>
        )}
      </div>
      <input
        id="question"
        className={inputClass}
        value={text}
        disabled={disabled}
        maxLength={140}
        aria-invalid={!!error || undefined}
        placeholder={placeholder}
        onChange={(e) => {
          const next = e.target.value;
          // Keep the underline on the same word while they type around it.
          const keep = current === null ? -1 : next.split(/\s+/).filter(Boolean).findIndex((w) => core(w) === current);
          onChange(keep >= 0 ? withEmphasis(next, keep) : next);
        }}
      />
      {error && <FieldError>{error}</FieldError>}

      {words.length > 1 && (
        <div className="mt-2.5">
          <p className="mb-1 text-[12.5px] text-muted">Tap a word to highlight it</p>
          <p className="flex flex-wrap gap-x-0.5 gap-y-1 text-[15px] leading-7 text-ink">
            {words.map((word, i) => {
              const selected = i === selectedIndex;
              return (
                <button
                  key={`${word}-${i}`}
                  type="button"
                  disabled={disabled || !core(word)}
                  aria-pressed={selected}
                  onClick={() => onChange(withEmphasis(text, selected ? null : i))}
                  className={
                    selected
                      ? "rounded-[5px] bg-rose-soft px-1 font-medium text-rose-deep underline decoration-rose decoration-2 underline-offset-4"
                      : "rounded-[5px] px-1 transition hover:bg-surface disabled:hover:bg-transparent"
                  }
                >
                  {word}
                </button>
              );
            })}
          </p>
        </div>
      )}
    </div>
  );
}
