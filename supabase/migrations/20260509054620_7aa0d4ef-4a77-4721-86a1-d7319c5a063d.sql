ALTER TABLE public.user_permissions ADD COLUMN IF NOT EXISTS can_add boolean NOT NULL DEFAULT false;
UPDATE public.user_permissions SET can_add = true WHERE can_edit = true;