ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE public.profile_entries ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE public.profile_entries ADD COLUMN IF NOT EXISTS file_name text;

GRANT SELECT (cover_url) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Signed-in users can read app media" ON storage.objects;
CREATE POLICY "Signed-in users can read app media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('avatars','covers','publications'));

DROP POLICY IF EXISTS "Users upload own media" ON storage.objects;
CREATE POLICY "Users upload own media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('avatars','covers','publications') AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own media" ON storage.objects;
CREATE POLICY "Users update own media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('avatars','covers','publications') AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id IN ('avatars','covers','publications') AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users delete own media" ON storage.objects;
CREATE POLICY "Users delete own media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('avatars','covers','publications') AND (storage.foldername(name))[1] = auth.uid()::text);