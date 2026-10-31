ALTER POLICY "authenticated read videos" ON storage.objects
TO authenticated
USING (
  bucket_id = 'videos'
  AND (SELECT auth.uid()) IS NOT NULL
  AND (
    public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.videos v
      WHERE v.published
        AND (
          v.video_url = objects.name
          OR split_part(split_part(v.video_url, '/object/public/videos/', 2), '?', 1) = objects.name
          OR split_part(split_part(v.video_url, '/object/sign/videos/', 2), '?', 1) = objects.name
        )
        AND (
          v.level_id IS NOT NULL AND v.level_id = (
            SELECT l.id FROM public.levels l WHERE l.published ORDER BY l.sort_order NULLS LAST LIMIT 1
          )
          OR (
            (v.level_id IS NULL OR EXISTS (
              SELECT 1 FROM public.user_permissions up_level
              WHERE up_level.user_id = (SELECT auth.uid())
                AND up_level.can_view = true
                AND up_level.section = 'level:' || v.level_id::text
            ))
            AND EXISTS (
              SELECT 1 FROM public.user_permissions up_video
              WHERE up_video.user_id = (SELECT auth.uid())
                AND up_video.can_view = true
                AND up_video.section = 'video:' || v.id::text
            )
          )
        )
    )
  )
);