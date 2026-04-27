
-- ============ ربط الأهل بالأطفال ============
CREATE TABLE public.parent_kid_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, kid_id)
);
CREATE INDEX idx_pkl_parent ON public.parent_kid_links(parent_id);
CREATE INDEX idx_pkl_kid ON public.parent_kid_links(kid_id);
ALTER TABLE public.parent_kid_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent reads own links" ON public.parent_kid_links FOR SELECT
  USING (auth.uid() = parent_id OR auth.uid() = kid_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "parent inserts links" ON public.parent_kid_links FOR INSERT
  WITH CHECK (auth.uid() = parent_id OR auth.uid() = kid_id);
CREATE POLICY "parent deletes own links" ON public.parent_kid_links FOR DELETE
  USING (auth.uid() = parent_id OR has_role(auth.uid(),'admin'));

-- ============ رموز الدعوة ============
CREATE TABLE public.kid_invite_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kid_invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent reads own codes" ON public.kid_invite_codes FOR SELECT
  USING (auth.uid() = parent_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "parent creates codes" ON public.kid_invite_codes FOR INSERT
  WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "parent deletes codes" ON public.kid_invite_codes FOR DELETE
  USING (auth.uid() = parent_id);

-- ============ إعدادات الأهل ============
CREATE TABLE public.parental_settings (
  kid_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_limit_minutes INTEGER NOT NULL DEFAULT 60 CHECK (daily_limit_minutes BETWEEN 0 AND 600),
  restrictions_enabled BOOLEAN NOT NULL DEFAULT true,
  rest_day_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.parental_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kid reads own settings" ON public.parental_settings FOR SELECT
  USING (
    auth.uid() = kid_id
    OR has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.parent_kid_links WHERE parent_id = auth.uid() AND kid_id = parental_settings.kid_id)
  );
CREATE POLICY "parent writes settings" ON public.parental_settings FOR ALL
  USING (
    has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.parent_kid_links WHERE parent_id = auth.uid() AND kid_id = parental_settings.kid_id)
  )
  WITH CHECK (
    has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.parent_kid_links WHERE parent_id = auth.uid() AND kid_id = parental_settings.kid_id)
  );

-- ============ جلسات الأطفال ============
CREATE TABLE public.kid_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kid_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_kid_sessions_kid_date ON public.kid_sessions(kid_id, session_date);
ALTER TABLE public.kid_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kid reads own sessions" ON public.kid_sessions FOR SELECT
  USING (
    auth.uid() = kid_id
    OR has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.parent_kid_links WHERE parent_id = auth.uid() AND kid_id = kid_sessions.kid_id)
  );
CREATE POLICY "kid inserts own sessions" ON public.kid_sessions FOR INSERT
  WITH CHECK (auth.uid() = kid_id);
CREATE POLICY "kid updates own sessions" ON public.kid_sessions FOR UPDATE
  USING (auth.uid() = kid_id);

-- ============ السماح للأهل بقراءة بيانات أطفالهم ============
-- إضافة سياسة: الأهل يقرؤون تقدم أطفالهم
CREATE POLICY "parent reads kid progress" ON public.user_progress FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.parent_kid_links WHERE parent_id = auth.uid() AND kid_id = user_progress.user_id));

CREATE POLICY "parent reads kid badges" ON public.user_badges FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.parent_kid_links WHERE parent_id = auth.uid() AND kid_id = user_badges.user_id));

CREATE POLICY "parent reads kid profile" ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.parent_kid_links WHERE parent_id = auth.uid() AND kid_id = profiles.id));

-- ============ دوال مساعدة ============
-- توليد كود دعوة عشوائي 6 أحرف للأهل الحالي
CREATE OR REPLACE FUNCTION public.create_kid_invite_code()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_code TEXT;
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  -- يجب أن يكون الأهل (parent) أو admin
  IF NOT (has_role(uid,'parent') OR has_role(uid,'admin')) THEN
    RAISE EXCEPTION 'only parents can create invite codes';
  END IF;
  new_code := upper(substring(md5(random()::text || clock_timestamp()::text), 1, 6));
  INSERT INTO public.kid_invite_codes (parent_id, code) VALUES (uid, new_code);
  RETURN new_code;
END; $$;
REVOKE EXECUTE ON FUNCTION public.create_kid_invite_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_kid_invite_code() TO authenticated;

-- ربط طفل بأهل عبر كود
CREATE OR REPLACE FUNCTION public.link_kid_with_code(invite_code TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  v_parent UUID;
  v_id UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT parent_id, id INTO v_parent, v_id
    FROM public.kid_invite_codes
    WHERE code = upper(invite_code) AND used_by IS NULL AND expires_at > now()
    LIMIT 1;
  IF v_parent IS NULL THEN RAISE EXCEPTION 'invalid or expired code'; END IF;
  IF v_parent = uid THEN RAISE EXCEPTION 'cannot link to self'; END IF;

  INSERT INTO public.parent_kid_links (parent_id, kid_id) VALUES (v_parent, uid)
    ON CONFLICT DO NOTHING;
  UPDATE public.kid_invite_codes SET used_by = uid, used_at = now() WHERE id = v_id;

  -- إنشاء إعدادات افتراضية إن لم تكن موجودة
  INSERT INTO public.parental_settings (kid_id, updated_by) VALUES (uid, v_parent)
    ON CONFLICT DO NOTHING;

  RETURN v_parent;
END; $$;
REVOKE EXECUTE ON FUNCTION public.link_kid_with_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_kid_with_code(TEXT) TO authenticated;

-- حساب دقائق اليوم للطفل
CREATE OR REPLACE FUNCTION public.get_kid_today_minutes(p_kid_id UUID)
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(duration_seconds) / 60, 0)::INTEGER
  FROM public.kid_sessions
  WHERE kid_id = p_kid_id AND session_date = CURRENT_DATE;
$$;
REVOKE EXECUTE ON FUNCTION public.get_kid_today_minutes(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_kid_today_minutes(UUID) TO authenticated;
