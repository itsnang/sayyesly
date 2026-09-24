import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "sayyesly · ask them to dinner",
  description: "Make a date invite where the \"no\" button runs away, and get the answer on Telegram.",
};

export default function Home() {
  return <LandingPage />;
}
