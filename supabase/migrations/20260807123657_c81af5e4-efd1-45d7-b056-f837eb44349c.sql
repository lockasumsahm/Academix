
ALTER TABLE public.profile_entries
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS download_count integer NOT NULL DEFAULT 0;

GRANT SELECT (view_count, download_count, file_url, file_name) ON public.profile_entries TO authenticated;

CREATE TABLE public.entry_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.profile_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entry_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.entry_likes TO authenticated;
GRANT ALL ON public.entry_likes TO service_role;
ALTER TABLE public.entry_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes readable" ON public.entry_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users add own likes" ON public.entry_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own likes" ON public.entry_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.entry_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.profile_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entry_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.entry_bookmarks TO authenticated;
GRANT ALL ON public.entry_bookmarks TO service_role;
ALTER TABLE public.entry_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own bookmarks" ON public.entry_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own bookmarks" ON public.entry_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own bookmarks" ON public.entry_bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.entry_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.profile_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entry_comments TO authenticated;
GRANT ALL ON public.entry_comments TO service_role;
ALTER TABLE public.entry_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments readable" ON public.entry_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users add own comments" ON public.entry_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own comments" ON public.entry_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.entry_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS entry_likes_entry_idx ON public.entry_likes(entry_id);
CREATE INDEX IF NOT EXISTS entry_comments_entry_idx ON public.entry_comments(entry_id);
CREATE INDEX IF NOT EXISTS entry_bookmarks_user_idx ON public.entry_bookmarks(user_id);

-- Signed-in members can read files attached to shared publications/projects.
CREATE POLICY "Signed-in users read shared publication files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'publications'
  AND EXISTS (
    SELECT 1 FROM public.profile_entries e
    WHERE e.file_url = 'publications/' || storage.objects.name
      AND e.kind IN ('publication', 'project')
  )
);

CREATE OR REPLACE FUNCTION public.increment_entry_view(_entry_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profile_entries SET view_count = view_count + 1 WHERE id = _entry_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_entry_download(_entry_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profile_entries SET download_count = download_count + 1 WHERE id = _entry_id;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_entry_view(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_entry_download(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_entry_view(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_entry_download(uuid) TO authenticated;
