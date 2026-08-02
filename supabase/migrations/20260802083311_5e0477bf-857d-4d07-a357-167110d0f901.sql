CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id uuid REFERENCES public.levels(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content_kind text NOT NULL DEFAULT 'pdf',
  file_url text,
  html_code text,
  cover_url text,
  sort_order integer DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.stories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories TO authenticated;
GRANT ALL ON public.stories TO service_role;

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published stories"
ON public.stories FOR SELECT
USING (published OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage stories"
ON public.stories FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER stories_set_updated_at
BEFORE UPDATE ON public.stories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();