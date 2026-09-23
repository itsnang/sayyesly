import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "ask her out · playful date invites",
  description: "Make a date invite where the “no” button runs away, and get the answer on Telegram.",
};

export default function Home() {
  return <LandingPage exampleHref="/demo" />;
}
