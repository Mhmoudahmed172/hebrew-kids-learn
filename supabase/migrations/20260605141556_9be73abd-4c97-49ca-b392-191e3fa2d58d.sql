DROP TRIGGER IF EXISTS award_points_after_progress ON public.user_progress;
CREATE TRIGGER award_points_after_progress
AFTER INSERT ON public.user_progress
FOR EACH ROW EXECUTE FUNCTION public.award_points_and_badges();

-- منح النقاط بأثر رجعي للتقدم اللي انحفظ قبل ما يصير في تريغر
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM public.user_progress LOOP
    PERFORM public.award_points_and_badges_backfill(r);
  END LOOP;
EXCEPTION WHEN undefined_function THEN
  -- نشغل المنطق مباشرة لو ما في دالة backfill
  FOR r IN SELECT user_id, content_type, score FROM public.user_progress LOOP
    INSERT INTO public.user_points (user_id, total_points, updated_at)
    VALUES (
      r.user_id,
      CASE r.content_type
        WHEN 'video' THEN 10
        WHEN 'quiz'  THEN COALESCE(r.score,0) * 5
        WHEN 'song'  THEN 3
        WHEN 'game'  THEN 5
        ELSE 0
      END,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET total_points = public.user_points.total_points + EXCLUDED.total_points,
        current_level = GREATEST(1, ((public.user_points.total_points + EXCLUDED.total_points) / 100) + 1),
        updated_at = now();
  END LOOP;
END $$;