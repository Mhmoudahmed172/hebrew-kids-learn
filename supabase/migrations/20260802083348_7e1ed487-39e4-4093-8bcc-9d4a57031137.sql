CREATE POLICY "Story files are readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

CREATE POLICY "Admins can upload story files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'stories' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update story files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'stories' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete story files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'stories' AND public.has_role(auth.uid(), 'admin'));