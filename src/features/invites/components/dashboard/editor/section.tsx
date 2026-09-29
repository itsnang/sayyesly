"use client";

import type { ReactNode } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { cx } from "@/components/shared/ui";
import type { StudioSection } from "../../../enums";
import type { InviteFormValues } from "../../../schemas";
import { useStudio } from "../../../stores/studio-store";
import type { ThemeContent } from "../../../themes";
import { hasError, SECTION_FIELDS, sectionTitle, summarise } from "./sections";

/**
 * One optional settings section: a single line with its current value until
 * it's opened. Knows whether it's open (the studio store), whether it has a
 * problem (the form) and what to say about itself (`summarise`).
 */
export function Section({ id, content, locked, children }: { id: StudioSection; content: ThemeContent; locked?: boolean; children: ReactNode }) {
  const open = useStudio((s) => s.openSections.includes(id));
  const toggle = useStudio((s) => s.toggleSection);
  const { control } = useFormContext<InviteFormValues>();
  const { errors } = useFormState({ control });
  const values = useWatch({ control }) as InviteFormValues;
  const invalid = hasError(errors, SECTION_FIELDS[id]);
  const summary = summarise(id, values, content);

  return (
    <div id={`section-${id}`} className="border-t border-ink/10">
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-surface/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose"
      >
        <span className="w-24 shrink-0 text-[14px] font-medium text-ink">{sectionTitle(id, content)}</span>
        <span className={cx("min-w-0 flex-1 truncate text-right text-[13.5px]", invalid ? "font-medium text-red-700" : "text-muted")}>
          {invalid ? "Needs a look" : locked ? `${summary} · locked` : summary}
        </span>
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className={cx("size-4 shrink-0 text-faint transition-transform", open && "rotate-90")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3.5 10.5 8 6 12.5" />
        </svg>
      </button>
      {open && <div className="min-w-0 px-5 pt-1 pb-6">{children}</div>}
    </div>
  );
}
