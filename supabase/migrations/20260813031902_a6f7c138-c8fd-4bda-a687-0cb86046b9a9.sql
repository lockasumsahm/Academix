-- 1. professors: split public read policy, keep contact_email out of anon reach
DROP POLICY IF EXISTS "Anyone can read professors" ON public.professors;
CREATE POLICY "Visitors can read public professor fields"
  ON public.professors FOR SELECT TO anon USING (true);
CREATE POLICY "Members can read professor listings"
  ON public.professors FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.professors FROM anon;
GRANT SELECT (id, full_name, university_id, department, research_areas, lab_name,
  profile_link, scholar_link, researchgate_link, accepting_students, created_at)
  ON public.professors TO anon;
REVOKE SELECT ON public.professors FROM authenticated;
GRANT SELECT (id, full_name, university_id, department, research_areas, lab_name,
  profile_link, scholar_link, researchgate_link, accepting_students, created_at,
  contact_email, user_id)
  ON public.professors TO authenticated;

-- 2. profiles: email never readable by other members
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
CREATE POLICY "Members can read profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.profiles FROM authenticated, anon;
GRANT SELECT (id, full_name, university, major, research_interests, created_at, headline,
  bio, avatar_url, cover_url, country, city, education_level, graduation_year, skills,
  languages, website_url, scholar_url, linkedin_url, github_url, orcid,
  open_to_collaboration, profile_completed, updated_at, message_privacy)
  ON public.profiles TO authenticated;

-- 3. user_roles: only your own role rows
DROP POLICY IF EXISTS "Roles are readable" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE ALL ON public.user_roles FROM anon;

-- 4. move has_role out of the exposed public schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Professors can create their own listing" ON public.professors;
CREATE POLICY "Professors can create their own listing"
  ON public.professors FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND private.has_role(auth.uid(), 'professor'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);