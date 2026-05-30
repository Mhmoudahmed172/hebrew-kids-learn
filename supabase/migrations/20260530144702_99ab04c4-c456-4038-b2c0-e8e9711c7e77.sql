
-- إنشاء bucket عام لملفات الألعاب
INSERT INTO storage.buckets (id, name, public)
VALUES ('games', 'games', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- قراءة عامة (الألعاب تظهر للزوار)
CREATE POLICY "Games files are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'games');

-- الأدمن فقط يرفع/يعدّل/يحذف
CREATE POLICY "Admins can upload game files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'games' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update game files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'games' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete game files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'games' AND has_role(auth.uid(), 'admin'::app_role));
