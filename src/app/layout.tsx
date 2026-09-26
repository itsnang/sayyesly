import type { Metadata } from "next";
import { Architects_Daughter, Caveat, Courier_Prime, Fraunces, Instrument_Sans } from "next/font/google";
import { BASE_OPEN_GRAPH, BASE_TWITTER, SITE_DESCRIPTION, SITE_HOME_TITLE, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const architectsDaughter = Architects_Daughter({
  variable: "--font-architects-daughter",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Child pages read "log in · sayyesly"; the home page uses the default.
  title: { default: SITE_HOME_TITLE, template: `%s · ${SITE_TITLE}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_TITLE,
  // No canonical here: it would be inherited by every page and point them all at "/".
  // Indexable pages set their own.
  openGraph: BASE_OPEN_GRAPH,
  twitter: BASE_TWITTER,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${architectsDaughter.variable} ${instrumentSans.variable} ${fraunces.variable} ${courierPrime.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
