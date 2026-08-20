-- 1. Hide profile emails from other users (column-level)
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, full_name, university, major, research_interests, created_at, headline, bio,
  avatar_url, country, city, education_level, graduation_year, skills, languages, website_url,
  scholar_url, linkedin_url, github_url, orcid, open_to_collaboration, profile_completed, updated_at)
  ON public.profiles TO authenticated;

-- 2. Hide professor contact emails from anonymous visitors
REVOKE SELECT ON public.professors FROM anon;
GRANT SELECT (id, full_name, university_id, department, research_areas, lab_name, profile_link,
  scholar_link, researchgate_link, accepting_students, created_at) ON public.professors TO anon;
GRANT SELECT ON public.professors TO authenticated;

-- 3. Move SECURITY DEFINER helper out of the exposed API schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = _conversation_id AND user_id = _user_id)
$$;
REVOKE ALL ON FUNCTION private.is_conversation_participant(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_conversation_participant(uuid, uuid) TO authenticated, service_role;

DROP POLICY "Participants read participants" ON public.conversation_participants;
CREATE POLICY "Participants read participants" ON public.conversation_participants FOR SELECT TO authenticated
  USING (private.is_conversation_participant(conversation_id, auth.uid()));

DROP POLICY "Participants read conversations" ON public.conversations;
CREATE POLICY "Participants read conversations" ON public.conversations FOR SELECT TO authenticated
  USING (private.is_conversation_participant(id, auth.uid()));

DROP POLICY "Participants update conversations" ON public.conversations;
CREATE POLICY "Participants update conversations" ON public.conversations FOR UPDATE TO authenticated
  USING (private.is_conversation_participant(id, auth.uid()));

DROP POLICY "Participants read messages" ON public.messages;
CREATE POLICY "Participants read messages" ON public.messages FOR SELECT TO authenticated
  USING (private.is_conversation_participant(conversation_id, auth.uid()));

DROP POLICY "Participants send messages" ON public.messages;
CREATE POLICY "Participants send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = sender_id) AND private.is_conversation_participant(conversation_id, auth.uid()));

DROP FUNCTION IF EXISTS public.is_conversation_participant(uuid, uuid);

-- 4. Block client-forged notifications; route through a validated definer function
DROP POLICY "Authenticated create notifications" ON public.notifications;
REVOKE INSERT ON public.notifications FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.notify_user(_user_id uuid, _kind text, _title text, _body text DEFAULT NULL, _link text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _actor uuid := auth.uid();
  _ok boolean := false;
BEGIN
  IF _actor IS NULL OR _user_id IS NULL OR _actor = _user_id THEN RETURN; END IF;
  IF _kind NOT IN ('reaction','comment','message','follow') THEN RETURN; END IF;
  IF length(coalesce(_title,'')) = 0 OR length(_title) > 200 THEN RETURN; END IF;

  IF _kind IN ('reaction','comment') THEN
    SELECT EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.author_id = _user_id
        AND ((_kind = 'reaction' AND EXISTS (SELECT 1 FROM public.post_reactions r WHERE r.post_id = p.id AND r.user_id = _actor))
          OR (_kind = 'comment' AND EXISTS (SELECT 1 FROM public.post_comments c WHERE c.post_id = p.id AND c.user_id = _actor)))
    ) INTO _ok;
  ELSIF _kind = 'follow' THEN
    SELECT EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id = _actor AND f.following_id = _user_id) INTO _ok;
  ELSIF _kind = 'message' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.conversation_participants a
      JOIN public.conversation_participants b ON b.conversation_id = a.conversation_id
      WHERE a.user_id = _actor AND b.user_id = _user_id
    ) INTO _ok;
  END IF;

  IF NOT _ok THEN RETURN; END IF;

  INSERT INTO public.notifications (user_id, actor_id, kind, title, body, link)
  VALUES (_user_id, _actor, _kind, left(_title, 200), left(_body, 500), left(_link, 300));
END;
$$;

REVOKE ALL ON FUNCTION public.notify_user(uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_user(uuid, text, text, text, text) TO authenticated;