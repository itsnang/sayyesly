// PROTOTYPE (throwaway, never merged): three variants of the binder Theme's flow for
// ticket #152 on map #148, switchable via ?variant=A|B|C on /demo/binder-prototype.
// Example Stops only: nothing is loaded or saved. Not served in production.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bagel, marker } from "./fonts";
import { Prototype } from "./prototype";

export const metadata: Metadata = { title: "binder prototype", robots: { index: false, follow: false } };

export default async function BinderPrototypePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { variant } = await searchParams;
  return (
    <div className={`${marker.variable} ${bagel.variable}`}>
      <Prototype variant={typeof variant === "string" ? variant : "A"} />
    </div>
  );
}
