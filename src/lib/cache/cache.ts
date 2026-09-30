/** Where remembered values live. Values must be JSON-serialisable. */
export interface CacheStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
}

type CacheOptions = {
  store: CacheStore;
  /** The most a cache read may add to a call; a slower store counts as a miss. */
  timeoutMs?: number;
  onError?: (error: unknown) => void;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`cache store took over ${ms}ms`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

/**
 * Remembers slow answers that are the same for everyone (a YouTube video's
 * title, the bot's username). A cache problem never breaks or slows a call:
 * if the store fails or is slow, the value is loaded directly.
 */
export function createCache({ store, timeoutMs = 300, onError = console.error }: CacheOptions) {
  return {
    /** The value remembered under `key`, else `load()`'s, remembered for `ttlSeconds` unless it's null. */
    async remember<T>(key: string, ttlSeconds: number, load: () => Promise<T | null>): Promise<T | null> {
      try {
        const hit = await withTimeout(store.get(key), timeoutMs);
        if (hit !== null && hit !== undefined) return hit as T;
      } catch (error) {
        onError(error);
      }

      const value = await load();
      if (value !== null) {
        // Not awaited: the caller shouldn't wait for the write.
        void withTimeout(store.set(key, value, ttlSeconds), timeoutMs).catch(onError);
      }
      return value;
    },
  };
}

export type Cache = ReturnType<typeof createCache>;

/** Remembers in this server's memory: fine locally, not shared between instances. */
export function createMemoryCacheStore(now: () => number = Date.now): CacheStore {
  const entries = new Map<string, { value: unknown; expiresAt: number }>();
  return {
    async get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= now()) {
        entries.delete(key);
        return null;
      }
      return entry.value;
    },
    async set(key, value, ttlSeconds) {
      entries.set(key, { value, expiresAt: now() + ttlSeconds * 1000 });
    },
  };
}
