-- =====================================================================
-- Make yourself the admin.
--
-- BEFORE running this:
--   Supabase → Authentication → Users → "Add user" → "Create new user"
--   Enter your email + a strong password, tick "Auto Confirm User".
--
-- THEN: replace the email below with that same email and click Run.
-- =====================================================================

insert into public.admins (user_id)
select id from auth.users
where email = 'hkanojiya477@gmail.com'
on conflict (user_id) do nothing;

-- Check it worked — this should show one row with your email:
select a.user_id, u.email
from public.admins a
join auth.users u on u.id = a.user_id;
