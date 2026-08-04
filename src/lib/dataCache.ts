/**
 * Lightweight stale-while-revalidate cache for backend reads.
 *
 * - Memory cache (instant within the session)
 * - localStorage cache (instant on repeat visits / hard reloads)
 * - Background revalidation so data is never stale for long
 */

const PREFIX = "dc:v1:";
const memory = new Map<string, { at: number; data: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

export const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function readCache<T>(key: string, ttl = DEFAULT_TTL): { data: T; fresh: boolean } | null {
  const mem = memory.get(key);
  if (mem) return { data: mem.data as T, fresh: Date.now() - mem.at < ttl };

  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: T };
    memory.set(key, parsed);
    return { data: parsed.data, fresh: Date.now() - parsed.at < ttl };
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T) {
  const entry = { at: Date.now(), data };
  memory.set(key, entry);
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    /* quota / private mode – memory cache still works */
  }
}

/** Fetch with de-duplication: parallel callers share a single request. */
export function dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const running = inflight.get(key) as Promise<T> | undefined;
  if (running) return running;
  const p = fetcher()
    .then((data) => {
      writeCache(key, data);
      return data;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

/** Returns cached data immediately when fresh, otherwise fetches. */
export async function cachedQuery<T>(key: string, fetcher: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
  const hit = readCache<T>(key, ttl);
  if (hit?.fresh) return hit.data;
  return dedupe(key, fetcher);
}

/** Drop cached entries whose key starts with `prefix` (use after admin edits). */
export function invalidateCache(prefix = "") {
  for (const k of Array.from(memory.keys())) if (k.startsWith(prefix)) memory.delete(k);
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + prefix)) localStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}
