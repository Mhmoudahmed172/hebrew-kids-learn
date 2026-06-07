DROP POLICY IF EXISTS "authenticated read videos" ON storage.objects;

CREATE POLICY "authenticated read videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  (bucket_id = 'videos'::text) AND (auth.uid() IS NOT NULL)
);