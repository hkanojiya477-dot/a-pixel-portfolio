-- =====================================================================
-- A PIXEL 21 — database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It is safe to run more than once.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. ADMINS — the list of people allowed to manage the website.
--    Nobody can add themselves here from the website. You add yourself
--    once using supabase/make-admin.sql.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "Admins can read their own row" on public.admins;
create policy "Admins can read their own row"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.admins to authenticated;

-- Helper: "is the person making this request an admin?"
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. PROJECTS — your portfolio work.
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 150),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  client       text check (client is null or char_length(client) <= 120),
  year         int  check (year is null or year between 1990 and 2100),
  summary      text check (summary is null or char_length(summary) <= 300),
  description  text check (description is null or char_length(description) <= 10000),
  categories   text[] not null default '{}',
  cover_image  text,
  gallery      text[] not null default '{}',
  video_url    text,
  featured     boolean not null default false,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists projects_public_idx
  on public.projects (status, sort_order, published_at desc);

-- Keep updated_at / published_at correct automatically.
create or replace function public.projects_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists projects_before_write on public.projects;
create trigger projects_before_write
  before insert or update on public.projects
  for each row execute function public.projects_before_write();

alter table public.projects enable row level security;

-- Visitors only ever see PUBLISHED projects. Admins see everything.
drop policy if exists "Read published projects" on public.projects;
create policy "Read published projects"
  on public.projects for select
  to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

drop policy if exists "Admins insert projects" on public.projects;
create policy "Admins insert projects"
  on public.projects for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins update projects" on public.projects;
create policy "Admins update projects"
  on public.projects for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins delete projects" on public.projects;
create policy "Admins delete projects"
  on public.projects for delete
  to authenticated
  using ((select public.is_admin()));

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;


-- ---------------------------------------------------------------------
-- 3. CONTACT MESSAGES — submissions from the Contact page.
--    Visitors can send a message but can never read anyone's messages.
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 100),
  email      text not null check (char_length(email) between 3 and 200),
  service    text check (service is null or char_length(service) <= 60),
  budget     text check (budget is null or char_length(budget) <= 60),
  message    text not null check (char_length(message) between 10 and 5000),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can send a message" on public.contact_messages;
create policy "Anyone can send a message"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins read messages" on public.contact_messages;
create policy "Admins read messages"
  on public.contact_messages for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins delete messages" on public.contact_messages;
create policy "Admins delete messages"
  on public.contact_messages for delete
  to authenticated
  using ((select public.is_admin()));

grant insert on public.contact_messages to anon, authenticated;
grant select, delete on public.contact_messages to authenticated;


-- ---------------------------------------------------------------------
-- 4. IMAGE STORAGE — a public bucket for project images.
--    Anyone can VIEW images (so the website can show them),
--    only admins can UPLOAD, REPLACE or DELETE them.
--    Max 10 MB per image. SVG is intentionally not allowed (security).
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins upload project media" on storage.objects;
create policy "Admins upload project media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-media' and (select public.is_admin()));

drop policy if exists "Admins update project media" on storage.objects;
create policy "Admins update project media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-media' and (select public.is_admin()))
  with check (bucket_id = 'project-media' and (select public.is_admin()));

drop policy if exists "Admins delete project media" on storage.objects;
create policy "Admins delete project media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-media' and (select public.is_admin()));
