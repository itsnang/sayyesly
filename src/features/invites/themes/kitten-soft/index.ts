import type { ThemeContent, ThemeDefinition } from "../types";
import { KittenSoftInvite } from "./kitten-soft-invite";

export const kittenSoftContent: ThemeContent = {
  picture: { label: "Picture at the top", whenEmpty: "the kitten with the bouquet" },
  note: true,
  planPhotos: true,
};

export const kittenSoft: ThemeDefinition = {
  id: "kitten-soft",
  name: "Kitten Soft",
  thumbnail: "/landing/step-ask.png",
  content: kittenSoftContent,
  Invite: KittenSoftInvite,
};
