import "server-only";

// In-memory sliding-window limiter. Per server instance, so it's a speed bump
// against scripted spam, not a hard guarantee across replicas.
const hits = new Map<string, number[]>();
let lastSweep = Date.now();

/** Records a hit for `key`; returns false when it has had `limit` hits within `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastSweep > windowMs) sweep(now, windowMs);

  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

function sweep(now: number, windowMs: number) {
  lastSweep = now;
  for (const [key, times] of hits) {
    if (times.every((t) => now - t >= windowMs)) hits.delete(key);
  }
}

/** Best-effort client IP behind Railway's proxy. */
export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
