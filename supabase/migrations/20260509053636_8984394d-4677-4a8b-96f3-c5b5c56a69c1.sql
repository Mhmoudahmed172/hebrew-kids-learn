
UPDATE public.user_permissions
SET can_view=true, can_edit=true, can_delete=true, updated_at=now()
WHERE user_id='182bea1a-10ac-43e4-90c6-0560ab7168bf';
