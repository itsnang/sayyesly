import { Permanent_Marker } from "next/font/google";

// Only Binder Invites download it (#153). Its handwriting (Caveat, Architects
// Daughter) and typewriter (Courier Prime) come from the root layout.
export const markerFont = Permanent_Marker({ variable: "--font-marker", subsets: ["latin"], weight: "400" });
