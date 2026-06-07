
-- 1) handle_new_user — never trust user-supplied role metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count INT;
  desired_role app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, age)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NULLIF(NEW.raw_user_meta_data ->> 'age','')::INT
  );

  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count <= 1 THEN
    desired_role := 'admin';
  ELSE
    desired_role := 'kid';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, desired_role);
  RETURN NEW;
END;
$function$;

-- 2) Restrict quiz_questions SELECT; expose safe RPCs
DROP POLICY IF EXISTS "authenticated read questions" ON public.quiz_questions;

CREATE OR REPLACE FUNCTION public.get_quiz_questions(p_quiz_id uuid)
RETURNS TABLE(id uuid, quiz_id uuid, question text, options jsonb, sort_order int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT qq.id, qq.quiz_id, qq.question, qq.options, qq.sort_order
  FROM public.quiz_questions qq
  JOIN public.quizzes q ON q.id = qq.quiz_id
  WHERE qq.quiz_id = p_quiz_id
    AND (q.published OR public.has_role(auth.uid(), 'admin'))
    AND auth.uid() IS NOT NULL
  ORDER BY qq.sort_order;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_questions(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.check_quiz_answer(p_question_id uuid, p_answer int)
RETURNS TABLE(correct boolean, correct_index int)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_ci int;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT qq.correct_index INTO v_ci
  FROM public.quiz_questions qq
  JOIN public.quizzes q ON q.id = qq.quiz_id
  WHERE qq.id = p_question_id
    AND (q.published OR public.has_role(auth.uid(), 'admin'));
  IF v_ci IS NULL THEN RAISE EXCEPTION 'not found'; END IF;
  RETURN QUERY SELECT (p_answer = v_ci), v_ci;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_quiz_answer(uuid, int) TO authenticated;

-- 3) Remove direct INSERT/UPDATE policies on user_points and user_badges
DROP POLICY IF EXISTS "system insert points" ON public.user_points;
DROP POLICY IF EXISTS "system update points" ON public.user_points;
DROP POLICY IF EXISTS "insert own user badges" ON public.user_badges;

CREATE POLICY "admin update points"
ON public.user_points
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 4) Quiz score integrity — bounds check + trigger caps score
ALTER TABLE public.user_progress
  DROP CONSTRAINT IF EXISTS user_progress_score_bounds;
ALTER TABLE public.user_progress
  ADD CONSTRAINT user_progress_score_bounds
  CHECK (
    score IS NULL OR (
      score >= 0 AND COALESCE(max_score,0) >= 0
      AND (max_score IS NULL OR max_score = 0 OR score <= max_score)
    )
  );

CREATE OR REPLACE FUNCTION public.award_points_and_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  earned_points INT := 0;
  v_total INT;
  v_videos INT;
  v_quizzes INT;
  v_q_count INT;
  v_capped_score INT;
  b RECORD;
BEGIN
  IF NEW.content_type = 'video' THEN
    earned_points := 10;
  ELSIF NEW.content_type = 'quiz' THEN
    SELECT COUNT(*) INTO v_q_count FROM public.quiz_questions WHERE quiz_id = NEW.content_id;
    v_capped_score := LEAST(GREATEST(COALESCE(NEW.score, 0), 0), COALESCE(v_q_count, 0));
    earned_points := v_capped_score * 5;
    NEW.score := v_capped_score;
    NEW.max_score := COALESCE(v_q_count, 0);
  ELSIF NEW.content_type = 'song' THEN
    earned_points := 3;
  ELSIF NEW.content_type = 'game' THEN
    earned_points := 5;
  END IF;

  INSERT INTO public.user_points (user_id, total_points, updated_at)
    VALUES (NEW.user_id, earned_points, now())
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = public.user_points.total_points + earned_points,
        current_level = GREATEST(1, ((public.user_points.total_points + earned_points) / 100) + 1),
        updated_at = now();

  SELECT total_points INTO v_total FROM public.user_points WHERE user_id = NEW.user_id;
  SELECT COUNT(*) INTO v_videos  FROM public.user_progress WHERE user_id = NEW.user_id AND content_type='video';
  SELECT COUNT(*) INTO v_quizzes FROM public.user_progress WHERE user_id = NEW.user_id AND content_type='quiz';

  FOR b IN SELECT * FROM public.badges LOOP
    IF (b.threshold_type='first_action' AND b.code='first_video' AND v_videos >= 1)
       OR (b.threshold_type='first_action' AND b.code='first_quiz' AND v_quizzes >= 1)
       OR (b.threshold_type='videos_completed' AND v_videos >= b.threshold_value)
       OR (b.threshold_type='quizzes_completed' AND v_quizzes >= b.threshold_value)
       OR (b.threshold_type='total_points' AND v_total >= b.threshold_value)
    THEN
      INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, b.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END; $function$;

DROP TRIGGER IF EXISTS award_points_and_badges_trg ON public.user_progress;
CREATE TRIGGER award_points_and_badges_trg
BEFORE INSERT ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.award_points_and_badges();

-- 5) Videos table — restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "public read videos" ON public.videos;

CREATE POLICY "authenticated read videos"
ON public.videos
FOR SELECT
TO authenticated
USING (published OR public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.videos FROM anon;
