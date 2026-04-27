
-- 1. Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'parent', 'kid');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Security definer to avoid recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 2. Content tables
CREATE TABLE public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'mint',
  sort_order INT DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID REFERENCES public.levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT,
  sort_order INT DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_index INT NOT NULL DEFAULT 0,
  sort_order INT DEFAULT 0
);

CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- profiles
CREATE POLICY "view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "admin delete profile" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- user_roles
CREATE POLICY "view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- public read for content
CREATE POLICY "public read levels" ON public.levels FOR SELECT USING (published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write levels" ON public.levels FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "public read videos" ON public.videos FOR SELECT USING (published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write videos" ON public.videos FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "public read quizzes" ON public.quizzes FOR SELECT USING (published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write quizzes" ON public.quizzes FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "public read questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "admin write questions" ON public.quiz_questions FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "public read songs" ON public.songs FOR SELECT USING (published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write songs" ON public.songs FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "public read games" ON public.games FOR SELECT USING (published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write games" ON public.games FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 5. Trigger: auto-create profile + assign role on signup (first user becomes admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
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
    desired_role := COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'role','')::app_role,
      'kid'
    );
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, desired_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_levels_updated BEFORE UPDATE ON public.levels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_videos_updated BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_quizzes_updated BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Storage bucket for videos (public read, large size)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', true, 524288000, ARRAY['video/mp4','video/webm','video/quicktime','video/x-matroska'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('thumbnails', 'thumbnails', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "public read videos bucket" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "admin upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update videos" ON storage.objects FOR UPDATE USING (bucket_id = 'videos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete videos" ON storage.objects FOR DELETE USING (bucket_id = 'videos' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "public read thumbs" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
CREATE POLICY "admin write thumbs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'thumbnails' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update thumbs" ON storage.objects FOR UPDATE USING (bucket_id = 'thumbnails' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete thumbs" ON storage.objects FOR DELETE USING (bucket_id = 'thumbnails' AND public.has_role(auth.uid(),'admin'));

-- 8. Seed initial levels
INSERT INTO public.levels (slug, title, description, color, sort_order) VALUES
  ('alphabet','الحروف الأبجدية','تعلّم حروف الأبجدية العبرية','mint',1),
  ('words','الكلمات الأساسية','مفردات يومية للأطفال','peach',2),
  ('sentences','الجمل البسيطة','تكوين جمل قصيرة','sky',3),
  ('conversations','المحادثات','حوارات يومية ممتعة','pink',4),
  ('reading','القراءة','قصص قصيرة للقراءة','sun',5)
ON CONFLICT (slug) DO NOTHING;
