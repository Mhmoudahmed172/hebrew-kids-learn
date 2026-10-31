ALTER POLICY "public read badges"
ON public.badges
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL);

ALTER POLICY "authenticated read videos"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'videos'
  AND (SELECT auth.uid()) IS NOT NULL
  AND (
    public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.videos AS v
      WHERE v.published
        AND (
          v.video_url = storage.objects.name
          OR split_part(split_part(v.video_url, '/object/public/videos/', 2), '?', 1) = storage.objects.name
          OR split_part(split_part(v.video_url, '/object/sign/videos/', 2), '?', 1) = storage.objects.name
        )
    )
  )
);

ALTER POLICY "Story files are readable"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'stories'
  AND (SELECT auth.uid()) IS NOT NULL
  AND (
    public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.stories AS s
      WHERE s.published
        AND (
          s.file_url = storage.objects.name
          OR split_part(split_part(s.file_url, '/object/public/stories/', 2), '?', 1) = storage.objects.name
          OR split_part(split_part(s.file_url, '/object/sign/stories/', 2), '?', 1) = storage.objects.name
        )
    )
  )
);

ALTER POLICY "public read thumbs"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
);

ALTER POLICY "Games files are publicly readable"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'games'
  AND public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
);
