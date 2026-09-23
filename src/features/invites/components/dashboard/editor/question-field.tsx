"use client";

import { inputClass } from "@/components/shared/ui";

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
  value: string;
  onChange: (markup: string) => void;
  disabled?: boolean;
  error?: string | undefined;
};

/**
 * The question as plain text, plus "tap a word to underline it". Stores the
 * `*word*` markup the themes understand, so nobody has to type asterisks.
 */
export function QuestionField({ value, onChange, disabled, error }: QuestionFieldProps) {
  const text = plain(value);
  const current = emphasised(value);
  const words = text.split(/\s+/).filter(Boolean);
  const selectedIndex = current === null ? -1 : words.findIndex((w) => core(w) === current);

  return (
    <div>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Your question</span>
        <input
          className={inputClass}
          value={text}
          disabled={disabled}
          maxLength={140}
          placeholder="will you have dinner with me?"
          onChange={(e) => {
            const next = e.target.value;
            // Keep the underline on the same word while they type around it.
            const keep = current === null ? -1 : next.split(/\s+/).filter(Boolean).findIndex((w) => core(w) === current);
            onChange(keep >= 0 ? withEmphasis(next, keep) : next);
          }}
        />
      </label>
      {error && (
        <p role="alert" className="mt-1.5 text-[12.5px] text-red-700">
          {error}
        </p>
      )}

      {words.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-[12.5px] text-muted">Tap a word to underline it</p>
          <div className="flex flex-wrap gap-1.5">
            {words.map((word, i) => {
              const selected = i === selectedIndex;
              return (
                <button
                  key={`${word}-${i}`}
                  type="button"
                  disabled={disabled || !core(word)}
                  aria-pressed={selected}
                  onClick={() => onChange(withEmphasis(text, selected ? null : i))}
                  className={`rounded-lg px-2.5 py-1 text-[14px] transition ${
                    selected ? "bg-ink text-canvas underline decoration-rose decoration-2 underline-offset-4" : "border border-ink/15 bg-card text-ink hover:border-ink/50"
                  } disabled:opacity-50`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!disabled && (
        <div className="mt-4">
          <p className="mb-2 text-[12.5px] text-muted">Or start from one of these</p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange(t)}
                className="rounded-full border border-dashed border-ink/30 px-3 py-1 font-mono text-[12px] text-ink transition hover:border-ink hover:bg-card"
              >
                {plain(t)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
