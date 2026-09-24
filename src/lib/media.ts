/**
 * Whether Next's image optimiser may fetch and resize `src` itself: a local
 * asset, or a photo on our own R2 bucket (the only host in next.config.ts's
 * remotePatterns). An arbitrary link a Creator pasted from elsewhere, or a
 * `blob:` object URL while a photo is still uploading, isn't — pass
 * `unoptimized` for those instead of adding arbitrary hosts to the optimiser.
 */
export function isOptimizable(src: string | null | undefined): boolean {
  if (!src) return true;
  if (src.startsWith("/")) return true;
  const r2 = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  return !!r2 && src.startsWith(r2);
}
