-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf', -- 'pdf' or 'html'
  content_html TEXT,
  sort_order INT DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Select policy: authenticated read published stories, or admin read all
CREATE POLICY "authenticated read stories"
ON public.stories
FOR SELECT
TO authenticated
USING (published OR public.has_role(auth.uid(), 'admin'));

-- Anon select policy: read published stories for landing page demo
CREATE POLICY "public read published stories"
ON public.stories
FOR SELECT
TO anon
USING (published = true);

-- Admin CRUD policies
CREATE POLICY "admin insert stories"
ON public.stories
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update stories"
ON public.stories
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin delete stories"
ON public.stories
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Storage Bucket for stories (PDF & HTML files and covers)
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for stories bucket
CREATE POLICY "Public Read Stories Objects"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

CREATE POLICY "Admin Upload Stories Objects"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'stories' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin Update Stories Objects"
ON storage.objects FOR UPDATE
USING (bucket_id = 'stories' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin Delete Stories Objects"
ON storage.objects FOR DELETE
USING (bucket_id = 'stories' AND public.has_role(auth.uid(), 'admin'));
