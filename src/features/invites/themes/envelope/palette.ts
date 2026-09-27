/** Envelope's colours, shared by the page (as `--env-*` CSS variables) and its link-preview image. */
export const COLORS = {
  table: "#eeebe6",
  diary: "#f8f6f0",
  card: "#f3ecdf",
  "paper-deep": "#ddd0b9",
  envelope: "#e5d8bf",
  "envelope-front": "#eadfc9",
  "envelope-flap": "#e1d3b8",
  "envelope-in": "#d3c3a4",
  ink: "#2637c4",
  graphite: "#8d8a83",
  faint: "#c4c0b8",
  rule: "rgba(38,55,196,.2)",
  error: "#b8433a",
  sun: "#f4c54a",
  leaf: "#a3c27f",
  "leaf-ink": "#6f8f55",
  petal: "#f3a9b9",
  sky: "#b8d0f0",
} as const;

export const CSS_VARIABLES = Object.fromEntries(Object.entries(COLORS).map(([name, value]) => [`--env-${name}`, value]));
