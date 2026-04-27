import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * يبدأ جلسة عند دخول الطفل المسجّل ويُحدّث المدّة كل 30 ثانية.
 * عند مغادرة الصفحة يُسجّل ended_at.
 */
export const useKidSessionTracker = () => {
  const { user, isKid } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const startedRef = useRef<number>(0);

  useEffect(() => {
    if (!user || !isKid) return;
    let cancelled = false;

    (async () => {
      startedRef.current = Date.now();
      const { data, error } = await supabase
        .from("kid_sessions")
        .insert({ kid_id: user.id })
        .select("id")
        .single();
      if (!cancelled && !error && data) sessionIdRef.current = data.id;
    })();

    const tick = setInterval(async () => {
      if (!sessionIdRef.current) return;
      const seconds = Math.floor((Date.now() - startedRef.current) / 1000);
      await supabase.from("kid_sessions")
        .update({ duration_seconds: seconds })
        .eq("id", sessionIdRef.current);
    }, 30_000);

    const finalize = async () => {
      if (!sessionIdRef.current) return;
      const seconds = Math.floor((Date.now() - startedRef.current) / 1000);
      await supabase.from("kid_sessions")
        .update({ duration_seconds: seconds, ended_at: new Date().toISOString() })
        .eq("id", sessionIdRef.current);
    };
    window.addEventListener("beforeunload", finalize);

    return () => {
      cancelled = true;
      clearInterval(tick);
      window.removeEventListener("beforeunload", finalize);
      finalize();
    };
  }, [user, isKid]);
};
