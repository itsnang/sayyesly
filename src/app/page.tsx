import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";
import { BASE_OPEN_GRAPH } from "@/lib/site";

// Title, description and link preview come from the root layout's defaults.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...BASE_OPEN_GRAPH, url: "/" },
};

export default function Home() {
  return <LandingPage />;
}
