
-- ============ جدول التقدم ============
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video','quiz','song','game')),
  content_id UUID NOT NULL,
  level_id UUID,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_type, content_id)
);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_level ON public.user_progress(level_id);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own progress" ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "insert own progress" ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own progress" ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============ جدول النقاط ============
CREATE TABLE public.user_points (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- يقرأ الجميع المسجلين دخول للوحة المتصدرين
CREATE POLICY "leaderboard read points" ON public.user_points FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "system insert points" ON public.user_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "system update points" ON public.user_points FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));

-- ============ جدول الشارات ============
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT NOT NULL DEFAULT '🏆',
  threshold_type TEXT NOT NULL CHECK (threshold_type IN ('videos_completed','quizzes_completed','total_points','first_action')),
  threshold_value INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "admin write badges" ON public.badges FOR ALL
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view all user badges" ON public.user_badges FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert own user badges" ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============ بيانات الشارات الأساسية ============
INSERT INTO public.badges (code, name, description, emoji, threshold_type, threshold_value, sort_order) VALUES
('first_video','أول خطوة','شاهدت أول فيديو لك!','🌱','first_action',1,1),
('video_explorer','المستكشف','أكملت 5 فيديوهات','🧭',  'videos_completed',5,2),
('video_master','بطل الفيديوهات','أكملت 15 فيديو','🎬','videos_completed',15,3),
('first_quiz','المختبِر','أنهيت أول اختبار','📝','first_action',1,4),
('quiz_pro','عبقري الاختبارات','أنهيت 10 اختبارات','🧠','quizzes_completed',10,5),
('points_100','نجم صاعد','جمعت 100 نقطة','⭐','total_points',100,6),
('points_500','محترف','جمعت 500 نقطة','🌟','total_points',500,7),
('points_1000','أسطورة','جمعت 1000 نقطة','👑','total_points',1000,8);

-- ============ دالة احتساب النقاط ومنح الشارات ============
CREATE OR REPLACE FUNCTION public.award_points_and_badges()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  earned_points INT := 0;
  v_total INT;
  v_videos INT;
  v_quizzes INT;
  b RECORD;
BEGIN
  -- نقاط حسب النوع
  IF NEW.content_type = 'video' THEN earned_points := 10;
  ELSIF NEW.content_type = 'quiz' THEN earned_points := COALESCE(NEW.score,0) * 5;
  ELSIF NEW.content_type = 'song' THEN earned_points := 3;
  ELSIF NEW.content_type = 'game' THEN earned_points := 5;
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

  -- منح الشارات المؤهلة
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
END; $$;

CREATE TRIGGER trg_award_points_after_progress
AFTER INSERT ON public.user_progress
FOR EACH ROW EXECUTE FUNCTION public.award_points_and_badges();
