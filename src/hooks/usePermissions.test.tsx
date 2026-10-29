import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePermissions } from "./usePermissions";

const fixture = vi.hoisted(() => ({
  auth: { user: { id: "student-a" } as { id: string } | null, isAdmin: false, loading: false },
  rows: [] as { section: string; can_view: boolean; can_edit: boolean; can_delete: boolean }[],
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => fixture.auth }));
vi.mock("@/lib/dataCache", () => ({ cachedQuery: (_key: string, fetcher: () => Promise<unknown>) => fetcher() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: () => table === "levels"
          ? { order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: { id: "first-level" } }) }) }) }
          : Promise.resolve({ data: fixture.rows }),
      }),
    }),
  },
}));

const allow = (section: string) => ({ section, can_view: true, can_edit: false, can_delete: false });

describe("existing permission behavior (baseline, not backend security proof)", () => {
  beforeEach(() => {
    fixture.auth = { user: { id: "student-a" }, isAdmin: false, loading: false };
    fixture.rows = [];
  });

  it("keeps the first published level available to signed-out visitors", async () => {
    fixture.auth.user = null;
    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.canPlay("story", "one", "first-level")).toBe(true));
    expect(result.current.canPlay("story", "one", "paid-level")).toBe(false);
  });

  it("denies non-first-level items when no permissions are configured", async () => {
    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canPlay("video", "one", "paid-level")).toBe(false);
  });

  it("does not treat an allowed level as access to every individual story", async () => {
    fixture.rows = [allow("level:paid-level")];
    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canView("level:paid-level")).toBe(true);
    expect(result.current.canPlay("story", "one", "paid-level")).toBe(false);
  });

  it("requires both parent-level and individual-item permission outside the first level", async () => {
    fixture.rows = [allow("story:one")];
    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canPlay("story", "one", "paid-level")).toBe(false);
  });

  it.each(["video", "song", "quiz", "game", "story"] as const)("preserves explicitly granted %s access", async (kind) => {
    fixture.rows = [allow("level:paid-level"), allow(`${kind}:one`)];
    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canPlay(kind, "one", "paid-level")).toBe(true);
    expect(result.current.canPlay(kind, "different", "paid-level")).toBe(false);
  });

  it("preserves unrestricted admin content access", async () => {
    fixture.auth.isAdmin = true;
    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canPlay("game", "one", "paid-level")).toBe(true);
  });
});