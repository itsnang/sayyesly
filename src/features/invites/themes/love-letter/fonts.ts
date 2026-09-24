import { Mansalva, Montserrat, Nanum_Pen_Script } from "next/font/google";

/** Big marker handwriting: the question, the headings. */
export const marker = Mansalva({ variable: "--ll-marker", subsets: ["latin"], weight: "400" });

/** Ballpoint handwriting: the letter, notes, annotations. */
export const pen = Nanum_Pen_Script({ variable: "--ll-pen", subsets: ["latin"], weight: "400" });

/** Small printed caps: labels and details. */
export const print = Montserrat({ variable: "--ll-print", subsets: ["latin"], weight: ["400", "500", "600"] });
