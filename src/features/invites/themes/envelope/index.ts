import type { ThemeDefinition } from "../types";
import { EXAMPLE_PICTURE, EXAMPLE_PLAN_PHOTOS } from "../shared/example";
import { EnvelopeInvite } from "./envelope-invite";

export const envelope: ThemeDefinition = {
  id: "envelope",
  name: "Envelope",
  thumbnail: "/landing/envelope-card.png",
  content: {
    question: { label: "Invitation headline" },
    picture: { label: "Photo next to your letter", whenEmpty: "just the letter" },
    note: true,
    planPhotos: true,
    stops: false,
    song: true,
    example: {
      question: "dinner by the *river*?",
      note: "i've been wanting to take you here for a while.",
      picture: EXAMPLE_PICTURE,
      planPhotos: EXAMPLE_PLAN_PHOTOS,
    },
  },
  Invite: EnvelopeInvite,
};
