DROP POLICY IF EXISTS "Signed-in users can read profile media" ON storage.objects;
CREATE POLICY "Anyone can read profile media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = ANY (ARRAY['avatars'::text, 'covers'::text]));