CREATE OR REPLACE VIEW public.platform_stats
WITH (security_invoker = false) AS
SELECT
  (SELECT count(*) FROM public.profiles) AS members,
  (SELECT count(*) FROM public.profile_entries) AS publications,
  (SELECT count(*) FROM public.posts WHERE visibility = 'public') AS posts,
  (SELECT count(*) FROM public.professors) AS professors,
  (SELECT count(*) FROM public.professors WHERE accepting_students IS TRUE) AS accepting_professors,
  (SELECT count(*) FROM public.universities) AS universities,
  (SELECT count(DISTINCT country) FROM public.universities WHERE country IS NOT NULL) AS university_countries,
  (SELECT count(DISTINCT country) FROM public.profiles WHERE country IS NOT NULL AND country <> '') AS member_countries,
  (SELECT count(*) FROM public.opportunities WHERE status = 'open') AS open_opportunities;

GRANT SELECT ON public.platform_stats TO anon;
GRANT SELECT ON public.platform_stats TO authenticated;
GRANT SELECT ON public.platform_stats TO service_role;