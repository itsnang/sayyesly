// PROTOTYPE (throwaway, map #148 / ticket #152). Example data for the binder Theme:
// a Plan of several Stops, which the real Invite can't hold yet. Never saved.

export type ExampleStop = {
  /** "Lunch": the short name in the cover's numbered list */
  title: string;
  /** "enjoy lunch": the handwritten line beside the chapter title */
  subtitle: string;
  /** A plain label, not a real time (settled on the map) */
  time: string;
  place: string;
  description: string;
  photos: { url: string; caption: string }[];
};

export const EXAMPLE = {
  title: "The Three Chapters",
  byline: "by Dara & you",
  question: "Will you spend a whole Saturday with me?",
  picture: "/examples/photo.png",
  days: ["Sat 18 Oct", "Sun 19 Oct", "Sat 25 Oct"],
  stops: [
    {
      title: "Lunch",
      subtitle: "enjoy lunch",
      time: "12:00",
      place: "a Korean BBQ spot",
      description: "We'll grill far too much meat, then order one more plate of kimbap anyway.",
      photos: [
        { url: "/examples/food.png", caption: "the food ✦" },
        { url: "/examples/vibe.png", caption: "soju, please" },
      ],
    },
    {
      title: "Thrift",
      subtitle: "thrift time",
      time: "around 2pm",
      place: "two little vintage shops",
      description: "Browsing vintage clothes and hidden gems. I pick something for you, you pick something for me.",
      photos: [
        { url: "/examples/place.png", caption: "shop no. 1" },
        { url: "/examples/photo.png", caption: "hidden gems" },
      ],
    },
    {
      title: "Coffee & Sunset",
      subtitle: "coffee and sunset",
      time: "5:30pm",
      place: "a café by the river",
      description: "Iced coffee on the terrace while the sun goes down over the river. The best part, probably.",
      photos: [
        { url: "/examples/vibe.png", caption: "golden hour" },
        { url: "/examples/place.png", caption: "the terrace" },
        { url: "/examples/food.png", caption: "iced latte" },
      ],
    },
  ] satisfies ExampleStop[],
};
