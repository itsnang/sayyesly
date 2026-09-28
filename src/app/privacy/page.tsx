import type { Metadata } from "next";
import { PrivacyContent } from "@/features/landing/components/legal-content";
import { BASE_OPEN_GRAPH, BASE_TWITTER, SITE_TITLE } from "@/lib/site";

const DESCRIPTION = "What sayyesly keeps about you, who helps us run it, and how to have it deleted.";

export const metadata: Metadata = {
  title: "Privacy",
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: { ...BASE_OPEN_GRAPH, url: "/privacy", title: `Privacy · ${SITE_TITLE}`, description: DESCRIPTION },
  twitter: { ...BASE_TWITTER, title: `Privacy · ${SITE_TITLE}`, description: DESCRIPTION },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
