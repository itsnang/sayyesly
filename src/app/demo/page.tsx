import type { Metadata } from "next";
import { ThemePreview } from "@/features/invites/components/theme-preview";
import type { InviteFormValues } from "@/features/invites/schemas";
import { DEFAULT_THEME_ID } from "@/features/invites/themes";

export const metadata: Metadata = {
  title: "will you have dinner with me? (demo)",
  description: "Try it: one question, two buttons, and one of them runs away.",
};

// A public example invite. Answers stay in the browser: nothing is saved or sent.
const DEMO: InviteFormValues = {
  recipientName: "you",
  question: "will you have *dinner* with me?",
  message: "",
  imageUrl: "",
  planPlace: "mauu steak",
  planActivity: "steakhouse",
  planMapUrl: "",
  planDressCode: "",
  planNotes: "",
  planPhotos: [
    { url: "/pasted-1780505948966-1.png", alt: "restaurant exterior", caption: "" },
    { url: "/pasted-1780505892491-0.png", alt: "neon sign", caption: "the vibe ✦" },
    { url: "/pasted-1780505849218-0.png", alt: "a steak", caption: "the steak ✦" },
  ],
  timezone: "Asia/Phnom_Penh",
  allowCustomTime: true,
  timeSlots: [],
  themeId: DEFAULT_THEME_ID,
};

export default function DemoPage() {
  return <ThemePreview fixedValues={DEMO} />;
}
