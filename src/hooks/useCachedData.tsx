import { useEffect, useRef, useState } from "react";
import { DEFAULT_TTL, dedupe, readCache } from "@/lib/dataCache";

/**
 * Stale-while-revalidate data hook:
 * paints cached data instantly, then refreshes it from the backend in the background.
 */
export function useCachedData<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  ttl = DEFAULT_TTL
) {
  const cached = key ? readCache<T>(key, ttl) : null;
  const [data, setData] = useState<T | null>(cached ? cached.data : null);
  const [loading, setLoading] = useState(!cached);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    const hit = readCache<T>(key, ttl);
    if (hit) {
      setData(hit.data);
      setLoading(false);
      if (hit.fresh) return; // fresh enough – no network at all
    } else {
      setLoading(true);
    }

    dedupe(key, fetcherRef.current)
      .then((fresh) => {
        if (!cancelled) setData(fresh);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, ttl]);

  return { data, loading };
}
