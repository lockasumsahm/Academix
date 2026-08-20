-- Ensure professor contact emails are never readable by anonymous visitors
REVOKE SELECT (contact_email, user_id) ON public.professors FROM anon;
REVOKE ALL ON public.professors FROM anon;
GRANT SELECT (id, university_id, full_name, department, lab_name, research_areas, profile_link, scholar_link, researchgate_link, accepting_students, created_at) ON public.professors TO anon;

-- Ensure user emails are never readable by other members
REVOKE SELECT (email) ON public.profiles FROM authenticated, anon;

-- Allow senders to edit only their own messages
DROP POLICY IF EXISTS "Senders can edit own messages" ON public.messages;
CREATE POLICY "Senders can edit own messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);