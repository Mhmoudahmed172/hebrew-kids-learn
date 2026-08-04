import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cachedQuery } from "@/lib/dataCache";

type Perm = { can_view: boolean; can_edit: boolean; can_delete: boolean };

export const usePermissions = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [perms, setPerms] = useState<Record<string, Perm>>({});
  const [hasAny, setHasAny] = useState(false);
  const [firstLevelId, setFirstLevelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    (async () => {
      const id = await cachedQuery<string | null>("levels:first-published", async () => {
        const { data } = await supabase
          .from("levels")
          .select("id")
          .eq("published", true)
          .order("sort_order")
          .limit(1)
          .maybeSingle();
        return data?.id ?? null;
      });
      setFirstLevelId(id);
    })();
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPerms({});
      setHasAny(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      const rows = await cachedQuery<any[]>(
        `user_permissions:${user.id}`,
        async () => {
          const { data } = await supabase
            .from("user_permissions")
            .select("section,can_view,can_edit,can_delete")
            .eq("user_id", user.id);
          return data || [];
        },
        60 * 1000 // 1 minute – permissions should react quickly
      );
      const map: Record<string, Perm> = {};
      rows.forEach((r: any) => {
        map[r.section] = { can_view: r.can_view, can_edit: r.can_edit, can_delete: r.can_delete };
      });
      setPerms(map);
      setHasAny(rows.length > 0);
      setLoading(false);
    })();
  }, [user, authLoading]);


  /** Whether a single section key (e.g. "level:<id>", "video:<id>") is viewable. */
  const canView = useCallback((key: string): boolean => {
    if (isAdmin) return true;
    if (key.startsWith("level:") && firstLevelId && key === `level:${firstLevelId}`) return true;
    if (!user) return false;
    if (!hasAny) return false; // no permissions configured → default deny
    return perms[key]?.can_view === true;
  }, [isAdmin, hasAny, perms, firstLevelId, user]);

  /**
   * Whether a content item can be played:
   * - its own key must be viewable
   * - AND its parent level must be viewable
   */
  const canPlay = useCallback((kind: "video" | "song" | "quiz" | "game" | "story", contentId: string, levelId?: string | null): boolean => {
    if (isAdmin) return true;
    if (levelId && firstLevelId && levelId === firstLevelId) return true;
    if (!user) return false;
    if (!hasAny) return false;
    if (levelId && !canView(`level:${levelId}`)) return false;
    return canView(`${kind}:${contentId}`);
  }, [isAdmin, hasAny, canView, firstLevelId, user]);

  return { perms, hasAny, loading: loading || authLoading, isAdmin, canView, canPlay };
};
