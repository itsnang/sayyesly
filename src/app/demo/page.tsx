import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThemePreview } from "@/features/invites/components/theme-preview";
import type { InviteFormValues } from "@/features/invites/schemas";
import { DEFAULT_THEME_ID, getTheme, hasTheme } from "@/features/invites/themes";
import { withExample } from "@/features/invites/utils/example";
import { DEFAULT_TIME_OF_DAY } from "@/features/invites/utils/time-of-day";
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

// A public example invite: the Theme's own example (the same one the studio
// preview shows) with a plan. Answers stay in the browser: nothing is saved or sent.
const DEMO: InviteFormValues = {
  recipientName: "you",
  question: "",
  message: "",
  imageUrl: "",
  // No real place: the demo shouldn't look like it's promoting a venue. The
  // Theme's example picture and plan photos are drawings, so they stay.
  planPlace: "",
  planActivity: "dinner, then a walk",
  planMapUrl: "",
  planDressCode: "",
  planNotes: "",
  planPhotos: [],
  timezone: "Asia/Phnom_Penh",
  allowCustomTime: true,
  timeOfDay: DEFAULT_TIME_OF_DAY,
  timeSlots: [],
  themeId: DEFAULT_THEME_ID,
};

export default async function DemoPage({ searchParams }: PageProps<"/demo">) {
  const { theme: requested } = await searchParams;
  const theme = getTheme(typeof requested === "string" && hasTheme(requested) ? requested : DEFAULT_THEME_ID);
  if (!theme) notFound();
  const { values } = withExample({ ...DEMO, themeId: theme.id }, theme.content);
  return <ThemePreview fixedValues={values} />;
}
