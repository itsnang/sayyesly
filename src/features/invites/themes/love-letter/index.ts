import type { ThemeDefinition } from "../types";
import { EXAMPLE_PLAN_PHOTOS } from "../shared/example";
import { LoveLetterInvite } from "./love-letter-invite";

export const loveLetter: ThemeDefinition = {
  id: "love-letter",
  name: "Love Letter",
  thumbnail: "/landing/theme-love-letter.png",
  content: {
    question: { label: "Invitation headline" },
    picture: { label: "Photo next to your letter", whenEmpty: "just the letter" },
    note: true,
    planPhotos: true,
    example: {
      question: "dinner by the *river*?",
      note: "i've been wanting to take you here for a while.",
      picture: "/pasted-1780505948966-1.png",
      planPhotos: EXAMPLE_PLAN_PHOTOS,
    },
  },
  Invite: LoveLetterInvite,
};
