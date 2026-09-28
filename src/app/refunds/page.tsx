import type { Metadata } from "next";
import { RefundsContent } from "@/features/landing/components/legal-content";
import { BASE_OPEN_GRAPH, BASE_TWITTER, SITE_TITLE } from "@/lib/site";

const DESCRIPTION = "What happens with paid Themes if a payment goes wrong.";

export const metadata: Metadata = {
  title: "Refunds",
  description: DESCRIPTION,
  alternates: { canonical: "/refunds" },
  openGraph: { ...BASE_OPEN_GRAPH, url: "/refunds", title: `Refunds · ${SITE_TITLE}`, description: DESCRIPTION },
  twitter: { ...BASE_TWITTER, title: `Refunds · ${SITE_TITLE}`, description: DESCRIPTION },
};

export default function RefundsPage() {
  return <RefundsContent />;
}
