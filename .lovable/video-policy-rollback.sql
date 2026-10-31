-- Rollback: restores the exact pre-change "authenticated read videos" policy (captured 2026-10-31).
ALTER POLICY "authenticated read videos" ON storage.objects
TO authenticated
USING (
  (bucket_id = 'videos'::text) AND ((SELECT auth.uid() AS uid) IS NOT NULL) AND (
    has_role((SELECT auth.uid() AS uid), 'admin'::app_role) OR (EXISTS (
      SELECT 1 FROM public.videos v
      WHERE (v.published AND (
        (v.video_url = objects.name)
        OR (split_part(split_part(v.video_url, '/object/public/videos/'::text, 2), '?'::text, 1) = objects.name)
        OR (split_part(split_part(v.video_url, '/object/sign/videos/'::text, 2), '?'::text, 1) = objects.name)
      ))
    ))
  )
);
