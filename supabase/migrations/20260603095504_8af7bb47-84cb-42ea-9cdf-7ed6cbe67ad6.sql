
-- 1) parent_kid_links: restrict INSERT to the kid only (or admin)
DROP POLICY IF EXISTS "parent inserts links" ON public.parent_kid_links;
CREATE POLICY "kid accepts link" ON public.parent_kid_links
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = kid_id OR public.has_role(auth.uid(), 'admin'));

-- 2) quiz_questions: require authenticated to read
DROP POLICY IF EXISTS "public read questions" ON public.quiz_questions;
CREATE POLICY "authenticated read questions" ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (true);

-- 3) user_badges: drop overly broad SELECT; add self-read (parent-read policy already exists)
DROP POLICY IF EXISTS "view all user badges" ON public.user_badges;
CREATE POLICY "user reads own badges" ON public.user_badges
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 4) user_points: drop leaderboard-wide SELECT; add self-read
DROP POLICY IF EXISTS "leaderboard read points" ON public.user_points;
CREATE POLICY "user reads own points" ON public.user_points
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Leaderboard via SECURITY DEFINER RPC (returns display name only)
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit int DEFAULT 50)
RETURNS TABLE (
  rank int,
  display_name text,
  total_points int,
  current_level int,
  is_me boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (row_number() OVER (ORDER BY up.total_points DESC))::int AS rank,
    COALESCE(p.full_name, 'متعلم') AS display_name,
    up.total_points,
    up.current_level,
    (up.user_id = auth.uid()) AS is_me
  FROM public.user_points up
  LEFT JOIN public.profiles p ON p.id = up.user_id
  ORDER BY up.total_points DESC
  LIMIT GREATEST(LEAST(p_limit, 100), 1);
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(int) TO authenticated;

-- 5) Storage: remove public read on private videos bucket
DROP POLICY IF EXISTS "public read videos bucket" ON storage.objects;

-- 6) Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.award_points_and_badges() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_kid_invite_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_kid_today_minutes(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.link_kid_with_code(text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_kid_invite_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_kid_today_minutes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_kid_with_code(text) TO authenticated;

-- has_role is used by RLS expressions — keep accessible
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;
