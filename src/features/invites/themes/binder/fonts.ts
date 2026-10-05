import { Abril_Fatface, Permanent_Marker } from "next/font/google";

// Only Binder Invites download these (#153): the marker, and the fat serif of the
// ransom-note cut-out letters. Its handwriting (Caveat, Architects Daughter) and
// typewriter (Courier Prime) come from the root layout.
export const markerFont = Permanent_Marker({ variable: "--font-marker", subsets: ["latin"], weight: "400" });
export const ransomFont = Abril_Fatface({ variable: "--font-ransom", subsets: ["latin"], weight: "400" });
