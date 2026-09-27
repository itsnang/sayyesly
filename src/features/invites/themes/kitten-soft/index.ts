import type { ThemeContent, ThemeDefinition } from "../types";
import { EXAMPLE_PLAN_PHOTOS } from "../shared/example";
import { KittenSoftInvite } from "./kitten-soft-invite";

export const kittenSoftContent: ThemeContent = {
  question: { label: "Question" },
  picture: { label: "Picture at the top", whenEmpty: "the kitten with the bouquet" },
  note: true,
  planPhotos: true,
  example: {
    question: "will you have *dinner* with me?",
    note: "no pressure :)",
    picture: null,
    planPhotos: EXAMPLE_PLAN_PHOTOS,
  },
};

export const kittenSoft: ThemeDefinition = {
  id: "kitten-soft",
  name: "Kitten Soft",
  thumbnail: "/landing/step-ask.png",
  content: kittenSoftContent,
  Invite: KittenSoftInvite,
};
