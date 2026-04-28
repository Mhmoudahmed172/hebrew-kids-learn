
-- 1) حالة المستخدم
CREATE TYPE public.user_status AS ENUM ('active','inactive','pending_payment','frozen','banned');

ALTER TABLE public.profiles
  ADD COLUMN status public.user_status NOT NULL DEFAULT 'active',
  ADD COLUMN status_note TEXT,
  ADD COLUMN status_updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Admin can update any profile
CREATE POLICY "admin update any profile"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- 2) جدول آراء العملاء
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  text TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  avatar_color TEXT DEFAULT 'bg-primary-gradient',
  card_color TEXT DEFAULT 'bg-primary-soft',
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read testimonials" ON public.testimonials FOR SELECT
USING (published OR has_role(auth.uid(),'admin'));
CREATE POLICY "admin write testimonials" ON public.testimonials FOR ALL
USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 3) جدول الأسئلة الشائعة
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read faqs" ON public.faqs FOR SELECT
USING (published OR has_role(auth.uid(),'admin'));
CREATE POLICY "admin write faqs" ON public.faqs FOR ALL
USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
