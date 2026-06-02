-- Perry Bags: dynamic homepage reels.
-- - A single-row `home_reels` config holds the section's heading text.
-- - `home_reels_items` holds each reel: a video plus an optional poster image,
--   title, caption, and a promotion link. All item fields except the primary
--   key and video are optional.
-- Paste into Supabase SQL editor. Safe to re-run.

-- ──────────────────────────────────────────────────────────────────────────
-- home_reels (singleton config)
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.home_reels (
  -- Singleton: a single row whose id is always TRUE.
  id           boolean primary key default true check (id),
  kicker       text,
  heading      text,
  description  text,
  updated_at   timestamptz not null default now()
);

drop trigger if exists home_reels_set_updated_at on public.home_reels;
create trigger home_reels_set_updated_at
before update on public.home_reels
for each row execute function public.set_updated_at();

insert into public.home_reels (id) values (true)
on conflict (id) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- home_reels_items
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.home_reels_items (
  id           uuid primary key default gen_random_uuid(),
  -- R2 key for the reel video.
  video_url    text,
  -- R2 key for an optional poster image (shown before the video plays).
  poster_url   text,
  title        text,
  caption      text,
  -- Optional promotion link (internal path or full URL) + its button label.
  promo_href   text,
  promo_label  text,
  sort_order   integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists home_reels_items_sort_idx
  on public.home_reels_items (sort_order, created_at);
create index if not exists home_reels_items_published_idx
  on public.home_reels_items (published) where published;

drop trigger if exists home_reels_items_set_updated_at on public.home_reels_items;
create trigger home_reels_items_set_updated_at
before update on public.home_reels_items
for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────────────────────────────

alter table public.home_reels enable row level security;
alter table public.home_reels_items enable row level security;

drop policy if exists "home_reels_public_read" on public.home_reels;
create policy "home_reels_public_read"
on public.home_reels for select
to anon, authenticated
using (true);

drop policy if exists "home_reels_admin_all" on public.home_reels;
create policy "home_reels_admin_all"
on public.home_reels for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "home_reels_items_public_read" on public.home_reels_items;
create policy "home_reels_items_public_read"
on public.home_reels_items for select
to anon, authenticated
using (published = true);

drop policy if exists "home_reels_items_admin_all" on public.home_reels_items;
create policy "home_reels_items_admin_all"
on public.home_reels_items for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
