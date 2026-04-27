import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * يجلب إعدادات الأهل وعدد الدقائق المستخدمة اليوم.
 * يعيد limitReached=true إذا تجاوز الطفل الحد اليومي.
 */
export const useParentalGuard = () => {
  const { user, isKid } = useAuth();
  const [limitMinutes, setLimitMinutes] = useState<number | null>(null);
  const [usedMinutes, setUsedMinutes] = useState<number>(0);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user || !isKid) { setLoading(false); return; }
    const [{ data: settings }, { data: mins }] = await Promise.all([
      supabase.from("parental_settings").select("*").eq("kid_id", user.id).maybeSingle(),
      supabase.rpc("get_kid_today_minutes", { p_kid_id: user.id }),
    ]);
    if (settings) {
      setLimitMinutes(settings.daily_limit_minutes);
      setEnabled(settings.restrictions_enabled);
    }
    setUsedMinutes(typeof mins === "number" ? mins : 0);
    setLoading(false);
  };

  useEffect(() => { refresh(); /* refresh every minute */
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
  }, [user, isKid]);

  const limitReached = enabled && limitMinutes !== null && usedMinutes >= limitMinutes;
  return { limitMinutes, usedMinutes, enabled, limitReached, loading, refresh };
};
