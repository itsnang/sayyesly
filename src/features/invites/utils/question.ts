import type { QuestionSegment } from "../types";

/** Splits "will you have *dinner* with me?" into plain and emphasised segments. */
export function parseQuestion(question: string): QuestionSegment[] {
  return question
    .split(/(\*[^*]+\*)/)
    .filter((part) => part.length > 0)
    .map((part) =>
      part.startsWith("*") && part.endsWith("*") && part.length > 2
        ? { text: part.slice(1, -1), emphasis: true }
        : { text: part, emphasis: false },
    );
}

/** The question as plain text, e.g. for page titles and notifications. */
export function questionText(segments: QuestionSegment[]): string {
  return segments.map((s) => s.text).join("");
}
