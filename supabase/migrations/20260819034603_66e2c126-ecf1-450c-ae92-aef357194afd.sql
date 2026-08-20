CREATE OR REPLACE FUNCTION private.is_shared_publication_file(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile_entries e
    WHERE e.file_url = 'publications/' || _name
      AND e.kind IN ('publication', 'project')
  );
$$;

REVOKE ALL ON FUNCTION private.is_shared_publication_file(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_shared_publication_file(text) TO authenticated;

DROP POLICY IF EXISTS "Signed-in users read shared publication files" ON storage.objects;
CREATE POLICY "Signed-in users read shared publication files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'publications' AND private.is_shared_publication_file(name));