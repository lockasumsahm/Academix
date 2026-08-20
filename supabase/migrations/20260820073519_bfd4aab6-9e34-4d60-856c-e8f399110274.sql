GRANT EXECUTE ON FUNCTION private.is_shared_publication_file(text) TO anon;

DROP POLICY IF EXISTS "Anyone reads shared publication files" ON storage.objects;
CREATE POLICY "Anyone reads shared publication files"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'publications' AND private.is_shared_publication_file(name));