// A ragged, torn-paper edge. Put it at the top or bottom of a paper section;
// it's filled with that section's colour so the paper looks ripped across.

function tornPath(seed: number): string {
  const width = 1200;
  const points: string[] = [];
  let x = 0;
  let i = 0;
  while (x <= width) {
    // Deterministic jitter (no Math.random, so server and client match).
    const n = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
    const jitter = n - Math.floor(n);
    const y = 4 + jitter * 12 + Math.sin(i * 0.7 + seed) * 2.5;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    x += 7 + jitter * 16;
    i++;
  }
  return `M0,20 L0,${points[0]!.split(",")[1]} L${points.join(" L")} L${width},20 Z`;
}

export function TornEdge({
  position,
  className,
  seed = 1,
}: {
  position: "top" | "bottom";
  /** Must set the fill colour, e.g. `text-grid-pink` */
  className?: string;
  seed?: number;
}) {
  return (
    <svg
      viewBox="0 0 1200 20"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 h-4 w-full drop-shadow-[0_-1px_0_rgba(0,0,0,0.04)] sm:h-5 ${
        position === "top" ? "bottom-full" : "top-full rotate-180"
      } ${className ?? ""}`}
    >
      <path d={tornPath(seed)} fill="currentColor" />
    </svg>
  );
}
