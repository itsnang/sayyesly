import type { PlanPhoto } from "../../types";

/**
 * Drawn placeholder photos of an example plan, for Themes' examples (the studio
 * preview and /demo). Illustrations on purpose: no real place is shown or promoted.
 */
export const EXAMPLE_PLAN_PHOTOS: PlanPhoto[] = [
  { url: "/examples/place.png", alt: "a small café front", caption: "" },
  { url: "/examples/vibe.png", alt: "string lights over a table", caption: "the vibe ✦" },
  { url: "/examples/food.png", alt: "a plate of food", caption: "the food ✦" },
];

/** A drawn placeholder for the picture a Theme shows beside the question. */
export const EXAMPLE_PICTURE = "/examples/photo.png";
