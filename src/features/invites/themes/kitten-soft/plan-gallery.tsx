import Image from "next/image";
import { isOptimizable } from "@/lib/media";
import type { PlanPhoto } from "../../types";

/** The Plan's photos across the top of the card: the first one large, the rest in a row with their captions. */
export function PlanGallery({ photos }: { photos: PlanPhoto[] }) {
  const [hero, ...others] = photos;
  if (!hero) return null;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", height: 230, overflow: "hidden", position: "relative" }}>
        <Image
          src={hero.url}
          unoptimized={!isOptimizable(hero.url)}
          alt={hero.alt}
          fill
          sizes="(max-width: 620px) 100vw, 620px"
          style={{ objectFit: "cover", filter: "brightness(.92) contrast(1.06)" }}
        />
      </div>
      {others.length > 0 && (
        <div style={{ display: "flex", gap: 2 }}>
          {others.map(({ url, alt, caption }) => (
            <div key={url} style={{ flex: 1, height: 148, overflow: "hidden", position: "relative" }}>
              <Image
                src={url}
                unoptimized={!isOptimizable(url)}
                alt={alt}
                fill
                sizes="(max-width: 620px) 50vw, 310px"
                style={{ objectFit: "cover", filter: "brightness(.88) contrast(1.08)" }}
              />
              {caption && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "24px 10px 8px",
                    background: "linear-gradient(transparent, rgba(20,5,15,.55))",
                    fontFamily: "var(--hand)",
                    fontSize: 13,
                    color: "rgba(255,255,255,.9)",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  {caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
