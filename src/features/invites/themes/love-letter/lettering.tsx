import type { ReactNode } from "react";

export const penStyle = { fontFamily: "var(--ll-pen)", fontSize: 25, lineHeight: 1.25, color: "var(--ll-ink)" } as const;

/** Small grey printed caps, like the corner labels of a diary page. */
export function Label({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" | "center" }) {
  return (
    <span
      style={{
        display: "block",
        fontFamily: "var(--ll-print)",
        fontSize: 10,
        fontWeight: 500,
        lineHeight: 1.45,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: "var(--ll-graphite)",
        textAlign: align,
      }}
    >
      {children}
    </span>
  );
}

export function MapLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ ...penStyle, display: "inline-block", marginTop: 6, textUnderlineOffset: 4 }}>
      → find it on the map
    </a>
  );
}

/** Picks a size for the question so long ones still fit: `[long, medium, short]`. */
export function sizeForQuestion(text: string, [long, medium, short]: readonly [number, number, number]) {
  return text.length > 34 ? long : text.length > 22 ? medium : short;
}
