import type { Metadata } from "next";
import DatePicker from "@/app/components/DatePicker";

export const metadata: Metadata = {
  title: "pick a night",
  robots: { index: false, follow: false },
};

export default function PickerPage() {
  return <DatePicker />;
}
