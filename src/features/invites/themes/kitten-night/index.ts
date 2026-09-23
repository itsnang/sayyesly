import type { ThemeDefinition } from "../types";
import { kittenSoftContent } from "../kitten-soft";
import { KittenNightInvite } from "./kitten-night-invite";

// Placeholder paid theme: kitten-soft at night. Replace with a real design when ready.
export const kittenNight: ThemeDefinition = {
  id: "kitten-night",
  name: "Kitten Night",
  thumbnail: "/landing/theme-night.png",
  // Same screens as kitten-soft, so the same content.
  content: kittenSoftContent,
  Invite: KittenNightInvite,
};
