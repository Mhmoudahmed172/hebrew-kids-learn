import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cachedQuery, dedupe, invalidateCache, readCache, writeCache } from "./dataCache";

describe("cache regression baseline", () => {
  beforeEach(() => {
    localStorage.clear();
    invalidateCache();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-29T06:00:00Z"));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    invalidateCache();
    localStorage.clear();
  });

  it("uses a fresh entry without repeating the network call", async () => {
    writeCache("lesson:one", { id: "one" });
    const fetcher = vi.fn(async () => ({ id: "two" }));
    expect(await cachedQuery("lesson:one", fetcher)).toEqual({ id: "one" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("refetches an entry once its specified TTL expires", async () => {
    writeCache("lesson:one", "old");
    vi.advanceTimersByTime(1001);
    const fetcher = vi.fn(async () => "new");
    expect(await cachedQuery("lesson:one", fetcher, 1000)).toBe("new");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("deduplicates simultaneous requests for the same key", async () => {
    const fetcher = vi.fn(async () => "lesson");
    const first = dedupe("lesson:one", fetcher);
    const second = dedupe("lesson:one", fetcher);
    expect(first).toBe(second);
    expect(await first).toBe("lesson");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not share requests or cached permissions between different user keys", async () => {
    const a = vi.fn(async () => ["story:allowed"]);
    const b = vi.fn(async () => []);
    const results = await Promise.all([
      cachedQuery("user_permissions:student-a", a),
      cachedQuery("user_permissions:student-b", b),
    ]);
    expect(results).toEqual([["story:allowed"], []]);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("retries a rejected request instead of caching its error", async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce("ok");
    await expect(cachedQuery("lesson:one", fetcher)).rejects.toThrow("offline");
    expect(readCache("lesson:one")).toBeNull();
    expect(await cachedQuery("lesson:one", fetcher)).toBe("ok");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("invalidates matching cache entries without removing auth storage or other cached keys", () => {
    localStorage.setItem("test-session", "synthetic-session-marker");
    writeCache("story:one", "body");
    writeCache("level:one", "metadata");
    invalidateCache("story:");
    expect(readCache("story:one")).toBeNull();
    expect(localStorage.getItem("dc:v1:story:one")).toBeNull();
    expect(readCache("level:one")?.data).toBe("metadata");
    expect(localStorage.getItem("test-session")).toBe("synthetic-session-marker");
  });

  it("ignores corrupt persisted JSON", () => {
    localStorage.setItem("dc:v1:broken", "not-json");
    expect(readCache("broken")).toBeNull();
  });

  it("keeps memory reads working if persistent storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    writeCache("lesson:one", "available");
    expect(readCache("lesson:one")?.data).toBe("available");
  });
});

describe("cache isolation acceptance cases — pending security-group approval", () => {
  it.todo("logout removes private story bodies and user permission caches");
  it.todo("an old-account request resolving after invalidation cannot repopulate private cache");
  it.todo("switching accounts cannot reuse a previous account's cached story body");
});