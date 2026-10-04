// PROTOTYPE: the marker font research #153 recommends. Typewriter (Courier Prime) and
// handwriting (Caveat, Architects Daughter) already come from the root layout.
import { Permanent_Marker } from "next/font/google";

export const marker = Permanent_Marker({ variable: "--font-marker", subsets: ["latin"], weight: "400" });
