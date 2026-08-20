insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users where lower(email) = '2701507@scarsdale.edu.pk'
on conflict (user_id, role) do nothing;

create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid
);

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant all on public.site_content to service_role;

alter table public.site_content enable row level security;

drop policy if exists "site_content public read" on public.site_content;
create policy "site_content public read" on public.site_content for select using (true);

drop policy if exists "site_content admin write" on public.site_content;
create policy "site_content admin write" on public.site_content for all to authenticated
  using (private.has_role(auth.uid(), 'admin'::public.app_role))
  with check (private.has_role(auth.uid(), 'admin'::public.app_role));
