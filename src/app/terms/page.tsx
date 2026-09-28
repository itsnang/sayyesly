import type { Metadata } from "next";
import { TermsContent } from "@/features/landing/components/legal-content";
import { BASE_OPEN_GRAPH, BASE_TWITTER, SITE_TITLE } from "@/lib/site";

const DESCRIPTION = "The rules for using sayyesly: your account, being kind, what you add, paid Themes and Songs.";

export const metadata: Metadata = {
  title: "Terms",
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: { ...BASE_OPEN_GRAPH, url: "/terms", title: `Terms · ${SITE_TITLE}`, description: DESCRIPTION },
  twitter: { ...BASE_TWITTER, title: `Terms · ${SITE_TITLE}`, description: DESCRIPTION },
};

export default function TermsPage() {
  return <TermsContent />;
}
