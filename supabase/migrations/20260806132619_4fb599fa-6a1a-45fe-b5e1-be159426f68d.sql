CREATE POLICY "Participants upload conversation attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND private.is_conversation_participant((storage.foldername(name))[1]::uuid, auth.uid())
);

CREATE POLICY "Participants read conversation attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND private.is_conversation_participant((storage.foldername(name))[1]::uuid, auth.uid())
);

CREATE POLICY "Uploader deletes conversation attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'message-attachments' AND owner = auth.uid());