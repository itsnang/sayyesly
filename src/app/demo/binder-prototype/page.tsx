// PROTOTYPE (throwaway, never merged): five variants of the binder Theme's flow for
// ticket #152 on map #148, switchable via ?variant=A|B|C|D|E on /demo/binder-prototype.
// Example Stops only: nothing is loaded or saved. Not served in production.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marker } from "./fonts";
import { Prototype } from "./prototype";

export const metadata: Metadata = { title: "binder prototype", robots: { index: false, follow: false } };

export default async function BinderPrototypePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { variant } = await searchParams;
  return (
    <div className={marker.variable}>
      <Prototype variant={typeof variant === "string" ? variant : "A"} />
    </div>
  );
}
