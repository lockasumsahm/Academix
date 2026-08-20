-- Opportunities: public read only, no anonymous writes
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.opportunities FROM anon;
GRANT SELECT ON public.opportunities TO anon;

-- Harden SECURITY DEFINER RPCs with in-function auth checks
CREATE OR REPLACE FUNCTION public.increment_entry_view(_entry_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  UPDATE public.profile_entries SET view_count = view_count + 1 WHERE id = _entry_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_entry_download(_entry_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  UPDATE public.profile_entries SET download_count = download_count + 1 WHERE id = _entry_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.my_profile_entries()
RETURNS SETOF public.profile_entries
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  RETURN QUERY SELECT * FROM public.profile_entries WHERE user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.increment_entry_view(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.increment_entry_download(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_profile_entries() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_entry_view(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_entry_download(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_profile_entries() TO authenticated, service_role;