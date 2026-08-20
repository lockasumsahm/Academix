-- 1. professors: hide contact_email from anonymous visitors
REVOKE SELECT ON public.professors FROM anon;
GRANT SELECT (id, full_name, university_id, department, research_areas, lab_name, profile_link, scholar_link, researchgate_link, accepting_students, created_at) ON public.professors TO anon;
GRANT SELECT ON public.professors TO authenticated;
GRANT ALL ON public.professors TO service_role;

-- 2. profiles: email no longer readable by other members
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, full_name, university, major, research_interests, created_at, headline, bio, avatar_url, cover_url, country, city, education_level, graduation_year, skills, languages, website_url, scholar_url, linkedin_url, github_url, orcid, open_to_collaboration, profile_completed, updated_at) ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 3. profile_entries: attached files only for the owner
REVOKE SELECT ON public.profile_entries FROM anon, authenticated;
GRANT SELECT (id, user_id, kind, title, organization, description, url, start_date, end_date, sort_order, created_at) ON public.profile_entries TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_entries TO authenticated;
GRANT ALL ON public.profile_entries TO service_role;

CREATE OR REPLACE FUNCTION public.my_profile_entries()
RETURNS SETOF public.profile_entries
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profile_entries
  WHERE user_id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.my_profile_entries() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_profile_entries() TO authenticated;

-- 4. storage: publication files readable only by their owner
DROP POLICY IF EXISTS "Signed-in users can read app media" ON storage.objects;

CREATE POLICY "Signed-in users can read profile media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('avatars', 'covers'));

CREATE POLICY "Owners read their publication files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'publications' AND (storage.foldername(name))[1] = auth.uid()::text);