import type { ThemeDefinition } from "../types";
import { BinderInvite } from "./binder-invite";

export const binder: ThemeDefinition = {
  id: "binder",
  name: "Binder",
  thumbnail: "/landing/binder-card.png",
  content: {
    question: { label: "Question on the last page" },
    picture: false,
    note: false,
    planPhotos: false,
    stops: { label: "chapter" },
    song: true,
    example: {
      question: "will you spend a whole *saturday* with me?",
      note: "",
      picture: null,
      planPhotos: [],
      planTitle: "The Three Chapters",
      // Drawings, not real places: the preview and /demo never promote a venue.
      stops: [
        {
          title: "Lunch",
          line: "enjoy lunch",
          time: "12:00",
          description: "We'll eat far too much, then order one more plate anyway.",
          place: "a little place you'll love",
          photos: [
            { url: "/examples/food.png", alt: "a plate of food", caption: "the food ✦" },
            { url: "/examples/vibe.png", alt: "string lights over a table", caption: "the vibe" },
          ],
        },
        {
          title: "Thrift",
          line: "thrift time",
          time: "around 2pm",
          description: "Browsing vintage clothes and hidden gems. I pick something for you, you pick something for me.",
          photos: [{ url: "/examples/place.png", alt: "a small shop front", caption: "hidden gems" }],
        },
        {
          title: "Coffee & Sunset",
          line: "coffee and sunset",
          time: "5:30pm",
          description: "Iced coffee on the terrace while the sun goes down. The best part, probably.",
          photos: [{ url: "/examples/photo.png", alt: "a sunny hillside", caption: "golden hour" }],
        },
      ],
    },
  },
  Invite: BinderInvite,
};
