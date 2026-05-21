-- جعل bucket الفيديوهات خاصاً (لا وصول علني)
UPDATE storage.buckets SET public = false WHERE id = 'videos';

-- سياسات: المستخدمون الموثقون يقرؤون عبر روابط موقّعة، الأدمن يكتب
DROP POLICY IF EXISTS "authenticated read videos" ON storage.objects;
CREATE POLICY "authenticated read videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "admin write videos storage" ON storage.objects;
CREATE POLICY "admin write videos storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));