import type { ThemeDefinition } from "../types";
import { LoveLetterInvite } from "./love-letter-invite";

export const loveLetter: ThemeDefinition = {
  id: "love-letter",
  name: "Love Letter",
  thumbnail: "/landing/theme-love-letter.png",
  content: {
    question: { label: "Invitation headline", placeholder: "dinner by the river?" },
    picture: { label: "Photo next to your letter", whenEmpty: "just the letter" },
    note: true,
    planPhotos: true,
  },
  Invite: LoveLetterInvite,
};
