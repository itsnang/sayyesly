import { Geist, Mansalva, Nanum_Pen_Script } from "next/font/google";

export const markerFont = Mansalva({ variable: "--env-marker", subsets: ["latin"], weight: "400" });

export const penFont = Nanum_Pen_Script({ variable: "--env-pen", subsets: ["latin"], weight: "400" });

// Geist, not Montserrat: the link-preview image draws its labels with assets/Geist-Regular.ttf.
export const printFont = Geist({ variable: "--env-print", subsets: ["latin"], weight: ["400", "500"] });
