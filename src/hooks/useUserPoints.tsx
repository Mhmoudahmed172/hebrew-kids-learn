import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserPoints = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setPoints(0); setLevel(1); setLoading(false); return; }
    const { data } = await supabase.from("user_points").select("total_points,current_level").eq("user_id", user.id).maybeSingle();
    setPoints(data?.total_points ?? 0);
    setLevel(data?.current_level ?? 1);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { points, level, loading, refresh };
};

/** Records user progress and awards points via DB trigger. Safe to call multiple times. */
export const recordProgress = async (params: {
  userId: string;
  contentType: "video" | "quiz" | "song" | "game";
  contentId: string;
  levelId?: string | null;
  score?: number;
  maxScore?: number;
}) => {
  const { error } = await supabase.from("user_progress").upsert({
    user_id: params.userId,
    content_type: params.contentType,
    content_id: params.contentId,
    level_id: params.levelId ?? null,
    score: params.score ?? 0,
    max_score: params.maxScore ?? 0,
  }, { onConflict: "user_id,content_type,content_id", ignoreDuplicates: true });
  return { error };
};
