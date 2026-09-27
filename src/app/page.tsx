import type { Metadata } from "next";
import { connection } from "next/server";
import { LandingPage } from "@/features/landing/components/landing-page";
import { landingThemePrices } from "@/features/landing/server/theme-prices";
import { BASE_OPEN_GRAPH } from "@/lib/site";

// Title, description and link preview come from the root layout's defaults.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...BASE_OPEN_GRAPH, url: "/" },
};

export default async function Home() {
  // Rendered per request so prices set in the admin show up without a redeploy
  // (and the build never needs the database).
  await connection();
  const prices = await landingThemePrices();
  return <LandingPage envelopePrice={prices.envelope} />;
}
