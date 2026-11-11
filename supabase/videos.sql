-- =====================================================================
-- A PIXEL — VIDEO SUPPORT (run once)
-- Supabase → SQL Editor → New query → paste this file → Run.
-- Safe to run more than once.
-- =====================================================================

-- 1. Projects can now hold many videos (uploaded files and/or links).
alter table public.projects
  add column if not exists videos jsonb not null default '[]'::jsonb;

alter table public.projects drop constraint if exists projects_videos_is_array;
alter table public.projects
  add constraint projects_videos_is_array check (jsonb_typeof(videos) = 'array');

-- Copy each old single "video link" into the new list (only where the list is still empty).
-- The old video_url column is left as it is, so the site keeps working before and after the code update.
update public.projects
set videos = jsonb_build_array(jsonb_build_object(
      'src', video_url,
      'shape', case when video_url ilike '%/shorts/%' then 'portrait' else 'landscape' end,
      'title', null))
where video_url is not null and video_url <> '' and videos = '[]'::jsonb;

-- 2. Let the media bucket accept video files too.
--    50 MB per file = the maximum on Supabase's free plan.
--    (On a paid plan you can raise this, e.g. 209715200 for 200 MB.)
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'
    ]
where id = 'project-media';
