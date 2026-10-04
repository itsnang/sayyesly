// PROTOTYPE: the two fonts the scrapbook-assets research (#153) recommends.
import { Bagel_Fat_One, Permanent_Marker } from "next/font/google";

export const marker = Permanent_Marker({ variable: "--font-marker", subsets: ["latin"], weight: "400" });
export const bagel = Bagel_Fat_One({ variable: "--font-bagel", subsets: ["latin"], weight: "400" });
