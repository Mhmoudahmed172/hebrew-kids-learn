-- Rollback: restores the CURRENT live "authenticated read videos" policy
-- (the version applied 2026-10-31 that INCLUDES the level_id IS NULL exception).
-- Use this only if the NULL-exception removal must be reverted.
ALTER POLICY "authenticated read videos" ON storage.objects
TO authenticated
USING (
  (bucket_id = 'videos'::text)
  AND ((SELECT auth.uid()) IS NOT NULL)
  AND (
    has_role((SELECT auth.uid()), 'admin'::app_role)
    OR (
      EXISTS (
        SELECT 1
        FROM videos v
        WHERE v.published
          AND (
            (v.video_url = objects.name)
            OR (split_part(split_part(v.video_url, '/object/public/videos/'::text, 2), '?'::text, 1) = objects.name)
            OR (split_part(split_part(v.video_url, '/object/sign/videos/'::text, 2), '?'::text, 1) = objects.name)
          )
          AND (
            -- Free level (first published level)
            ((v.level_id IS NOT NULL) AND (v.level_id = (SELECT l.id FROM levels l WHERE l.published ORDER BY l.sort_order LIMIT 1)))
            OR (
              -- Non-free levels: level permission (skipped when level_id IS NULL) AND video permission
              ((v.level_id IS NULL) OR (EXISTS (
                SELECT 1 FROM user_permissions up_level
                WHERE up_level.user_id = (SELECT auth.uid())
                  AND up_level.can_view = true
                  AND up_level.section = 'level:' || v.level_id::text
              )))
              AND EXISTS (
                SELECT 1 FROM user_permissions up_video
                WHERE up_video.user_id = (SELECT auth.uid())
                  AND up_video.can_view = true
                  AND up_video.section = 'video:' || v.id::text
              )
            )
          )
      )
    )
  )
);
