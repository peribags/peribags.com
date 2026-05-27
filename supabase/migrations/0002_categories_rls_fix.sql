-- Fix: the admin RLS policy was reading the top-level `role` claim (which is
-- the Postgres role, e.g. "authenticated"). The custom admin role lives at
-- app_metadata.role inside the JWT. Re-create the policy with the correct
-- JSON path.

drop policy if exists "categories_admin_all" on public.categories;

create policy "categories_admin_all"
on public.categories for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
