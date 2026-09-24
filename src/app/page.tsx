import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "sayyesly · plan a date they'll say yes to",
  description: "Send a sweet invite, plan the details, and get your answer on Telegram.",
};

export default function Home() {
  return <LandingPage />;
}
