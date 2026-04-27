ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS level_id uuid REFERENCES public.levels(id) ON DELETE SET NULL;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS level_id uuid REFERENCES public.levels(id) ON DELETE SET NULL;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_songs_level ON public.songs(level_id);
CREATE INDEX IF NOT EXISTS idx_games_level ON public.games(level_id);