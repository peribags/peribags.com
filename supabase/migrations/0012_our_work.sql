-- peribags: dynamic "Our Work" entries shown on /our-work.
-- Each row is one work card: a client/brand name, an optional logo, a
-- product picture, and a short description. `name` is also rendered as the
-- typographic wordmark when no logo is set.
-- Paste into Supabase SQL editor. Safe to re-run.

create table if not exists public.our_work_items (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  -- R2 key for the brand logo. Null → wordmark renders the name instead.
  logo_url      text,
  -- R2 key for the product picture. Required.
  image_url     text not null,
  description   text not null default '',
  sort_order    integer not null default 0,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists our_work_items_sort_idx
  on public.our_work_items (sort_order, created_at);
create index if not exists our_work_items_published_idx
  on public.our_work_items (published) where published;

drop trigger if exists our_work_items_set_updated_at on public.our_work_items;
create trigger our_work_items_set_updated_at
before update on public.our_work_items
for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────────────────────────────

alter table public.our_work_items enable row level security;

drop policy if exists "our_work_items_public_read" on public.our_work_items;
create policy "our_work_items_public_read"
on public.our_work_items for select
to anon, authenticated
using (published = true);

drop policy if exists "our_work_items_admin_all" on public.our_work_items;
create policy "our_work_items_admin_all"
on public.our_work_items for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
