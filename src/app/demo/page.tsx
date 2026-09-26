import type { Metadata } from "next";
import { ThemePreview } from "@/features/invites/components/theme-preview";
import type { InviteFormValues } from "@/features/invites/schemas";
import { DEFAULT_THEME_ID, hasTheme } from "@/features/invites/themes";
import { BASE_OPEN_GRAPH, BASE_TWITTER, SITE_TITLE } from "@/lib/site";

const DEMO_TITLE = "Try a demo invite";
const DEMO_DESCRIPTION =
  "Open a real sayyesly invite: the question, the plan and a time to pick, just as the person you ask would see it.";

export const metadata: Metadata = {
  title: DEMO_TITLE,
  description: DEMO_DESCRIPTION,
  alternates: { canonical: "/demo" },
  openGraph: { ...BASE_OPEN_GRAPH, url: "/demo", title: `${DEMO_TITLE} · ${SITE_TITLE}`, description: DEMO_DESCRIPTION },
  twitter: { ...BASE_TWITTER, title: `${DEMO_TITLE} · ${SITE_TITLE}`, description: DEMO_DESCRIPTION },
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

export default async function DemoPage({ searchParams }: PageProps<"/demo">) {
  const { theme } = await searchParams;
  const themeId = typeof theme === "string" && hasTheme(theme) ? theme : DEFAULT_THEME_ID;
  return <ThemePreview fixedValues={{ ...DEMO, themeId }} />;
}
