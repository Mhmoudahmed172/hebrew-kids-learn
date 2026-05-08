import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Perm = { can_view: boolean; can_edit: boolean; can_delete: boolean };

export const usePermissions = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [perms, setPerms] = useState<Record<string, Perm>>({});
  const [hasAny, setHasAny] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setPerms({}); setHasAny(false); setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("user_permissions")
        .select("section,can_view,can_edit,can_delete")
        .eq("user_id", user.id);
      const map: Record<string, Perm> = {};
      (data || []).forEach((r: any) => {
        map[r.section] = { can_view: r.can_view, can_edit: r.can_edit, can_delete: r.can_delete };
      });
      setPerms(map);
      setHasAny((data || []).length > 0);
      setLoading(false);
    })();
  }, [user, authLoading]);

  /** Whether a single section key (e.g. "level:<id>", "video:<id>") is viewable. */
  const canView = useCallback((key: string): boolean => {
    if (isAdmin) return true;
    if (!hasAny) return true; // no admin config → unrestricted
    return perms[key]?.can_view === true;
  }, [isAdmin, hasAny, perms]);

  /**
   * Whether a content item can be played:
   * - its own key must be viewable
   * - AND its parent level must be viewable
   */
  const canPlay = useCallback((kind: "video" | "song" | "quiz" | "game", contentId: string, levelId?: string | null): boolean => {
    if (isAdmin) return true;
    if (!hasAny) return true;
    if (levelId && !canView(`level:${levelId}`)) return false;
    return canView(`${kind}:${contentId}`);
  }, [isAdmin, hasAny, canView]);

  return { perms, hasAny, loading: loading || authLoading, isAdmin, canView, canPlay };
};
